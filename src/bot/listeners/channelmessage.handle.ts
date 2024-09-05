import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events, ChannelMessage, MezonClient } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/services/client.service';
import { ReplyMezonMessage } from '../asterisk-commands/dto/replyMessage.dto';
import { Asterisk } from '../asterisk-commands/asterisk';
import { Repository } from 'typeorm';
import { Channel, Mentioned, Msg, User } from '../models';
import { InjectRepository } from '@nestjs/typeorm';
import { checkTimeMention } from '../utils/helper';

@Injectable()
export class EventListenerChannelMessage {
  private client: MezonClient;
  constructor(
    private clientService: MezonClientService,
    private asteriskCommand: Asterisk,
    @InjectRepository(Mentioned)
    private mentionedRepository: Repository<Mentioned>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(Msg) private msgRepository: Repository<Msg>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.client = clientService.getClient();
  }

  @OnEvent(Events.ChannelMessage)
  async handleMentioned(message: ChannelMessage) {
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ last_message_id: message.message_id })
      .where('"userId" = :userId', { userId: message.sender_id })
      .andWhere(`deactive IS NOT True`)
      .execute();

    await this.mentionedRepository
      .createQueryBuilder()
      .update(Mentioned)
      .set({ confirm: true, reactionTimestamp: Date.now() })
      .where(`"channelId" = :channelId`, { channelId: message.channel_id })
      .andWhere(`"mentionUserId" = :mentionUserId`, {
        mentionUserId: message.sender_id,
      })
      .andWhere(`"confirm" = :confirm`, { confirm: false })
      .andWhere(`"reactionTimestamp" IS NULL`)
      .execute();
    if (message.mode === 4) return;

    // const checkCategories: string[] = [
    //   'PROJECTS',
    //   'PROJECTS-EXT',
    //   'PRODUCTS',
    //   'LOREN',
    //   'HRM&IT',
    //   'SAODO',
    //   'MANAGEMENT',
    // ];

    const validCategory: boolean = true;
    // if (channel.name.slice(0, 4).toUpperCase() === 'PRJ-') {
    //   validCategory = true;
    // } else {
    //   validCategory = checkCategories.includes(channel.name.toUpperCase());
    // }
    if (!checkTimeMention(new Date())) return;

    if (message.mentions && message.mentions.length && validCategory) {
      message.mentions.forEach(async (user) => {
        const data = {
          messageId: message.message_id,
          authorId: message.sender_id,
          channelId: message.channel_id,
          mentionUserId: user.user_id,
          createdTimestamp: new Date(message.create_time).getTime(),
          noti: false,
          confirm: false,
          punish: false,
          reactionTimestamp: null,
        };
        await this.mentionedRepository.insert(data);
      });
    }
  }

  @OnEvent(Events.ChannelMessage)
  async handleCommand(msg: ChannelMessage) {
    const content = msg.content.t;
    let replyMessage: ReplyMezonMessage;

    if (typeof content == 'string' && content.trim()) {
      const firstLetter = content.trim()[0];
      switch (firstLetter) {
        case '*':
          replyMessage = await this.asteriskCommand.execute(content, msg);
          break;
        default:
          return;
        // console.log(msg);
      }

      if (replyMessage) {
        const replyMessageArray = Array.isArray(replyMessage)
          ? replyMessage
          : [replyMessage];
        for (const mess of replyMessageArray) {
          await this.client.sendMessage(
            mess.clan_id,
            mess.channel_id,
            mess.mode,
            mess.is_public,
            mess.msg,
            mess.mentions,
            mess.attachments,
            mess.ref,
          );
        }
      }
    }
  }
}
