import type { Context, SessionFlavor } from "grammy";
import type {
  ConversationFlavor,
  Conversation as GrammyConversation,
} from "@grammyjs/conversations";
import type { I18nFlavor } from "@grammyjs/i18n";
import { Types } from "mongoose";

export enum MENU {
  HOME,
  MY_EVENTS,
  ALL_EVENTS,
  EVENT,
  SCHEDULE_EVENT,
  SEND_REPORT,
  CHANNEL_JOIN_STATUS,
}

export type Route = {
  menu: MENU;
  params: Record<string, any>;
};

export interface UserObject {
  _id: Types.ObjectId;
  first_name: string;
  last_name: string;
  user_name: string;
}

export interface SessionData {
  user: any;
  routes: Route[];
  conversation_state: Record<string, any>;
  is_anonim: boolean;
  step: string;
  request_type: string;
}

export type BotContext = Context &
  SessionFlavor<SessionData> &
  I18nFlavor &
  ConversationFlavor &
  {
    navigate: (menu: MENU, params?: Record<string, any>) => void;
  };

export type Conversation = GrammyConversation<BotContext>;

export interface ConversationResult<T = any> {
  data: T;
}

export interface InstanceMethods<T = any> {
  toObj(): T;
}

export type InstanceObject<T> = Omit<T, "_id"> & { _id: string };
