import { createChatBotMessage } from 'react-chatbot-kit';
import type { IConfig } from 'react-chatbot-kit';

const config: IConfig = {
  botName: "Asystent Emerytalny",
  initialMessages: [
    createChatBotMessage("Cześć! 👋 Widzę, że planujesz swoją emeryturę. Pomogę Ci szybko wypełnić formularz - wystarczy, że odpowiesz na kilka pytań. Gotowy?"),
    createChatBotMessage("Zacznijmy od podstaw - ile masz lat?")
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: 'rgb(63, 132, 210)',
    },
    chatButton: {
      backgroundColor: 'rgb(0, 153, 63)',
    },
  },
};

export default config;
