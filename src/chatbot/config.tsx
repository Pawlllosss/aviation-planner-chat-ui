import { createChatBotMessage } from 'react-chatbot-kit';
import type { IConfig } from 'react-chatbot-kit';

const BotAvatar = () => {
  return (
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
        border: '0.1rem solid',
    }}>
      <img
        src="/zus.png"
        alt="ZUS Bot"
        style={{
          width: '48px',
          height: '48px',
          objectFit: 'contain', background: 'white'
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
