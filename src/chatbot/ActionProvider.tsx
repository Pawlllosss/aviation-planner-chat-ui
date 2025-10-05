import type { RetirementFormData } from './types';

class ActionProvider {
  createChatBotMessage: any;
  setState: any;
  onComplete?: (data: RetirementFormData) => void;
  openAIKey?: string;

  constructor(
    createChatBotMessage: any,
    setStateFunc: any,
    createClientMessage: any,
    stateRef: any,
    createCustomMessage: any,
    props?: any
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;

    // react-chatbot-kit wraps custom props in actionProviderProps
    const actionProviderProps = props?.actionProviderProps || props;

    if (actionProviderProps) {
      this.onComplete = actionProviderProps.onComplete;
      this.openAIKey = actionProviderProps.openAIKey;
    }
  }

  async handleUserMessage(message: string) {
    const currentState = await new Promise<any>((resolve) => {
      this.setState((prev: any) => {
        resolve(prev);
        return prev;
      });
    });

    const currentStep = currentState.formData?.currentStep || 'age';
    const formData = { ...currentState.formData };

    const response = await this.getOpenAIResponse(message, currentStep, formData);

    const botMessage = this.createChatBotMessage(response);

    this.setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
      formData: { ...prev.formData, ...formData },
    }));

    console.log('Checking form completion with formData:', formData);
    console.log('isFormComplete:', this.isFormComplete(formData));

    if (this.isFormComplete(formData)) {
      setTimeout(() => {
        const completeMessage = this.createChatBotMessage(
          'Świetnie! Zebrałem wszystkie informacje. Przejdźmy do kalkulatora emerytury.'
        );
        this.setState((prev: any) => {
          const finalFormData = { ...prev.formData, ...formData };

          if (this.onComplete) {
            setTimeout(() => this.onComplete!(finalFormData), 1500);
          }

          return {
            ...prev,
            messages: [...prev.messages, completeMessage],
          };
        });
      }, 1000);
    }
  }

  async getOpenAIResponse(message: string, currentStep: string, formData: RetirementFormData): Promise<string> {
    try {
      if (!this.openAIKey) {
        return 'Przepraszam, brak klucza API. Skontaktuj się z administratorem.';
      }

      const systemPrompt = this.buildSystemPrompt(currentStep, formData);

      // Get conversation history from state
      const currentState = await new Promise<any>((resolve) => {
        this.setState((prev: any) => {
          resolve(prev);
          return prev;
        });
      });

      // Build conversation history for OpenAI
      const conversationHistory = currentState.messages
        .map((msg: any) => ({
          role: msg.type === 'bot' ? 'assistant' : 'user',
          content: msg.message
        }))
        .slice(-10); // Keep last 10 messages for context

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || '';

      // Extract data from user message using simple parsing
      this.extractDataFromMessage(message, currentStep, formData);

      return aiResponse;
    } catch (error) {
      console.error('OpenAI error:', error);
      return 'Przepraszam, wystąpił błąd. Spróbuj ponownie.';
    }
  }

  buildSystemPrompt(currentStep: string, formData: RetirementFormData): string {
    const basePrompt = `Jesteś przyjaznym asystentem emerytalnym, który pomaga ludziom zaplanować przyszłość. Rozmawiasz naturalnie, po polsku, jak dobry znajomy - ciepło, z humorem, ale profesjonalnie. Używaj emotikonów oszczędnie. Trzymaj odpowiedzi krótkie (max 2-3 zdania).`;

    switch (currentStep) {
      case 'age':
        return `${basePrompt} Użytkownik podał swój wiek. Potwierdź go w ludzki sposób (np. "Super, ${formData.age} lat!" lub "Okej, notujemy ${formData.age} lat") i naturalnie przejdź do pytania o płeć. Nie pisz "Jaka jest Twoja płeć" - zapytaj bardziej naturalnie, np. "Jesteś mężczyzną czy kobietą?" lub "Mężczyzna/kobieta?".`;
      case 'sex':
        return `${basePrompt} Użytkownik podał płeć. Potwierdź krótko i od razu zapytaj o miesięczne zarobki brutto w naturalny sposób, np. "Ile zarabiasz miesięcznie brutto?" lub "Jakie masz teraz zarobki brutto na miesiąc?". Możesz dodać zachętę jak "w złotych oczywiście 😊".`;
      case 'grossSalary':
        return `${basePrompt} Użytkownik podał zarobki (${formData.grossSalary} zł). Możesz zareagować (np. "Niezłe!" dla wysokiej kwoty lub po prostu "Okej"). Zapytaj w którym roku zaczął/zaczęła pracować, np. "W którym roku zacząłeś/zaczęłaś pracę?" lub "Od którego roku pracujesz?".`;
      case 'startYear':
        return `${basePrompt} Użytkownik podał rok rozpoczęcia pracy (${formData.startYear}). Możesz skomentować (np. "Sporo doświadczenia!" jeśli dawno, albo "Całkiem niedawno" jeśli ostatnio). Zapytaj naturalnie czy chce uwzględnić dni chorobowe, np. "Chcesz uwzględnić dni chorobowe w obliczeniach?" lub "Dodamy też dni chorobowe? (tak/nie)".`;
      case 'includeSickLeave': {
        const defaultRetirement = this.calculateSuggestedRetirementYear(formData);
        return `${basePrompt} Użytkownik odpowiedział na pytanie o uwzględnienie dni chorobowych. Jeśli odpowiedział "tak", zapytaj ile średnio dni chorobowych rocznie, np. "Ile średnio dni chorobowych rocznie?". Jeśli "nie", potwierdź i zapytaj o rok emerytury KONIECZNIE podając sugerowany rok ${defaultRetirement}, np. "Okej, pomijamy. W którym roku planujesz emeryturę? (sugerowany: ${defaultRetirement})".`;
      }
      case 'avgSickDaysPerYear': {
        const defaultRetirement = this.calculateSuggestedRetirementYear(formData);
        return `${basePrompt} Użytkownik podał liczbę dni chorobowych (${formData.avgSickDaysPerYear}). Potwierdź krótko i zapytaj naturalnie o planowany rok emerytury. MUSISZ podać sugerowany rok: ${defaultRetirement}, np. "A kiedy planujesz przejść na emeryturę? Sugeruję rok ${defaultRetirement}" lub "W którym roku emerytura? (sugerowany: ${defaultRetirement})".`;
      }
      case 'retirementYear':
        return `${basePrompt} Użytkownik podał rok przejścia na emeryturę (${formData.retirementYear}). Zareaguj naturalnie na to ile lat zostało (np. "To już za kilka lat!" lub "Jeszcze trochę czasu"). Zapytaj o kod pocztowy w swobodny sposób, np. "Podaj jeszcze kod pocztowy (jeśli chcesz), żeby dokładniej obliczyć". Daj wyraźnie znać, że można pominąć.`;
      case 'zipCode':
        return `${basePrompt} To ostatnie pytanie o kod pocztowy XX-XXX. Jeśli użytkownik chce pominąć, przyjmij to z gracją. Jeśli poda kod, potwierdź krótko i przyjaźnie, np. "Super, mamy wszystko!".`;
      default:
        return basePrompt;
    }
  }

  extractDataFromMessage(message: string, currentStep: string, formData: RetirementFormData): void {
    const lowerMessage = message.toLowerCase();

    switch (currentStep) {
      case 'age': {
        const age = this.extractNumber(message);
        if (age && age >= 18 && age <= 100) {
          formData.age = age;
          formData.currentStep = 'sex';
        }
        break;
      }

      case 'sex': {
        if (lowerMessage.includes('mężczyzna') || lowerMessage.includes('mezczyzna') || lowerMessage.includes('m')) {
          formData.sex = 'M';
          formData.currentStep = 'grossSalary';
        } else if (lowerMessage.includes('kobieta') || lowerMessage.includes('k')) {
          formData.sex = 'F';
          formData.currentStep = 'grossSalary';
        }
        break;
      }

      case 'grossSalary': {
        const salary = this.extractNumber(message);
        if (salary && salary >= 0 && salary <= 1000000) {
          formData.grossSalary = salary;
          formData.currentStep = 'startYear';
        }
        break;
      }

      case 'startYear': {
        const year = this.extractNumber(message);
        const currentYear = new Date().getFullYear();
        if (year && year >= 1950 && year <= currentYear) {
          formData.startYear = year;
          formData.currentStep = 'includeSickLeave';
        }
        break;
      }

      case 'includeSickLeave': {
        if (lowerMessage.includes('tak') || lowerMessage.includes('yes') || lowerMessage.includes('chc')) {
          formData.includeSickLeave = true;
          formData.currentStep = 'avgSickDaysPerYear';
        } else if (lowerMessage.includes('nie') || lowerMessage.includes('no') || lowerMessage.includes('pomiń')) {
          formData.includeSickLeave = false;
          formData.avgSickDaysPerYear = 0;
          formData.currentStep = 'retirementYear';
        }
        break;
      }

      case 'avgSickDaysPerYear': {
        const days = this.extractNumber(message);
        if (days !== null && days >= 0 && days <= 365) {
          formData.avgSickDaysPerYear = days;
          formData.currentStep = 'retirementYear';
        }
        break;
      }

      case 'retirementYear': {
        const year = this.extractNumber(message);
        const currentYear = new Date().getFullYear();

        // Check if user wants to use suggested year
        if (lowerMessage.includes('sugerowa') || lowerMessage.includes('sugeru') || lowerMessage.includes('tak') || lowerMessage.includes('domyśl')) {
          const suggestedYear = this.calculateSuggestedRetirementYear(formData);
          formData.retirementYear = suggestedYear;
          formData.currentStep = 'zipCode';
        } else if (year && year >= currentYear && year <= 2100) {
          formData.retirementYear = year;
          formData.currentStep = 'zipCode';
        }
        break;
      }

      case 'zipCode': {
        if (lowerMessage.includes('pomiń') || lowerMessage.includes('pomin') || lowerMessage.includes('nie')) {
          formData.zipCode = undefined;
          delete formData.currentStep;
        } else {
          const zipMatch = message.match(/\d{2}-?\d{3}/);
          if (zipMatch) {
            const zip = zipMatch[0].replace(/(\d{2})(\d{3})/, '$1-$2');
            formData.zipCode = zip;
            delete formData.currentStep;
          }
        }
        break;
      }
    }
  }

  extractNumber(text: string): number | null {
    const match = text.replace(/\s/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  calculateSuggestedRetirementYear(formData: RetirementFormData): number {
    const age = formData.age || 35;
    const sex = formData.sex || 'M';
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    const retirementAge = sex === 'M' ? 65 : 60;
    return birthYear + retirementAge;
  }

  isFormComplete(formData: RetirementFormData): boolean {
    return !!(
      formData.age &&
      formData.sex &&
      formData.grossSalary !== undefined &&
      formData.startYear &&
      formData.retirementYear &&
      !formData.currentStep
    );
  }
}

export default ActionProvider;
