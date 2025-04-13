declare module 'node-telegram-bot-api' {
  type ParseMode = 'Markdown' | 'HTML';

  interface TelegramUser {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  }
  
  interface TelegramChat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  }
  
  interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    // Другие поля сообщения...
  }
  
  interface InlineKeyboardButton {
    text: string;
    url?: string;
    callback_data?: string;
    switch_inline_query?: string;
    switch_inline_query_current_chat?: string;
  }
  
  interface KeyboardButton {
    text: string;
    request_contact?: boolean;
    request_location?: boolean;
  }
  
  interface ReplyKeyboardMarkup {
    keyboard: KeyboardButton[][];
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    selective?: boolean;
  }
  
  interface InlineKeyboardMarkup {
    inline_keyboard: InlineKeyboardButton[][];
  }
  
  interface SendMessageOptions {
    parse_mode?: ParseMode;
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
    reply_to_message_id?: number;
    reply_markup?: ReplyKeyboardMarkup | InlineKeyboardMarkup | any;
  }
  
  type BotCommand = 'text' | 'audio' | 'voice' | 'photo' | 'sticker' | 'video' | 'document' | 'location' | 'contact' | 'message';
  
  class TelegramBot {
    constructor(token: string, options?: { polling?: boolean | object });
    
    on(event: BotCommand | 'callback_query' | 'error', listener: (message: any, ...args: any[]) => void): this;
    onText(regexp: RegExp, callback: (msg: TelegramMessage, match: RegExpExecArray | null) => void): void;
    
    sendMessage(chatId: number | string, text: string, options?: SendMessageOptions): Promise<TelegramMessage>;
    answerCallbackQuery(callbackQueryId: string, options?: any): Promise<boolean>;
    
    // Другие методы бота...
  }
  
  export = TelegramBot;
}