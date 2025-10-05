import { createChatBotMessage } from 'react-chatbot-kit';
import type { IConfig } from 'react-chatbot-kit';

const BotAvatar = () => {
  return (
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'rgb(0, 65, 110)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <img
        src="/favicon.ico"
        alt="ZUS Bot"
        style={{
          width: '28px',
          height: '28px',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

const config: IConfig = {
  botName: "Asystent Emerytalny",
  initialMessages: [
    createChatBotMessage("Cześć! 👋 Widzę, że planujesz swoją emeryturę. Pomogę Ci szybko wypełnić formularz - wystarczy, że odpowiesz na kilka pytań. Gotowy?"),
    createChatBotMessage("Zaznijmy od podstaw - ile masz lat?")
  ],
  customComponents: {
    botAvatar: (props) => <BotAvatar {...props} />,
  },
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
