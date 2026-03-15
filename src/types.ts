export type Language = 'en' | 'hi' | 'mr';

export interface Translation {
  appName: string;
  home: string;
  chat: string;
  detect: string;
  schemes: string;
  support: string;
  welcome: string;
  selectLanguage: string;
  diseaseDetection: string;
  uploadImage: string;
  analyzing: string;
  diseaseName: string;
  causes: string;
  treatment: string;
  askChatbot: string;
  typeMessage: string;
  governmentSchemes: string;
  expertConsultants: string;
  tollFree: string;
  voiceAssistant: string;
  call: string;
  videoCall: string;
  chatNow: string;
  eligibility: string;
  benefits: string;
  howToApply: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    appName: "Smart Crop Care",
    home: "Home",
    chat: "AI Chat",
    detect: "Disease",
    schemes: "Schemes",
    support: "Support",
    welcome: "Welcome Farmer",
    selectLanguage: "Select Language",
    diseaseDetection: "Crop Disease Detection",
    uploadImage: "Upload or Capture Leaf Image",
    analyzing: "Analyzing image...",
    diseaseName: "Disease Name",
    causes: "Possible Causes",
    treatment: "Treatment Suggestions",
    askChatbot: "Ask our AI Assistant",
    typeMessage: "Type your question here...",
    governmentSchemes: "Government Schemes",
    expertConsultants: "Expert Consultants",
    tollFree: "Toll-Free Support",
    voiceAssistant: "Voice Assistant",
    call: "Call",
    videoCall: "Video Call",
    chatNow: "Chat Now",
    eligibility: "Eligibility",
    benefits: "Benefits",
    howToApply: "How to Apply",
  },
  hi: {
    appName: "स्मार्ट क्रॉप केयर",
    home: "होम",
    chat: "AI चैट",
    detect: "बीमारी",
    schemes: "योजनाएं",
    support: "सहायता",
    welcome: "किसान भाई का स्वागत है",
    selectLanguage: "भाषा चुनें",
    diseaseDetection: "फसल रोग पहचान",
    uploadImage: "पत्ते की फोटो अपलोड करें",
    analyzing: "फोटो की जांच हो रही है...",
    diseaseName: "बीमारी का नाम",
    causes: "संभावित कारण",
    treatment: "उपचार के सुझाव",
    askChatbot: "हमारे AI सहायक से पूछें",
    typeMessage: "अपना प्रश्न यहाँ लिखें...",
    governmentSchemes: "सरकारी योजनाएं",
    expertConsultants: "विशेषज्ञ सलाहकार",
    tollFree: "टोल-फ्री सहायता",
    voiceAssistant: "आवाज सहायक",
    call: "कॉल करें",
    videoCall: "वीडियो कॉल",
    chatNow: "चैट करें",
    eligibility: "पात्रता",
    benefits: "लाभ",
    howToApply: "आवेदन कैसे करें",
  },
  mr: {
    appName: "स्मार्ट क्रॉप केअर",
    home: "होम",
    chat: "AI चॅट",
    detect: "आजार",
    schemes: "योजना",
    support: "मदत",
    welcome: "शेतकरी बांधवांचे स्वागत आहे",
    selectLanguage: "भाषा निवडा",
    diseaseDetection: "पीक रोग ओळख",
    uploadImage: "पानाचे छायाचित्र अपलोड करा",
    analyzing: "तपासणी सुरू आहे...",
    diseaseName: "रोगाचे नाव",
    causes: "संभाव्य कारणे",
    treatment: "उपचाराचे उपाय",
    askChatbot: "आमच्या AI सहाय्यकाला विचारा",
    typeMessage: "तुमचा प्रश्न येथे लिहा...",
    governmentSchemes: "सरकारी योजना",
    expertConsultants: "तज्ञ सल्लागार",
    tollFree: "टोल-फ्री मदत",
    voiceAssistant: "आवाज सहाय्यक",
    call: "कॉल करा",
    videoCall: "व्हिडिओ कॉल",
    chatNow: "चॅट करा",
    eligibility: "पात्रता",
    benefits: "फायदे",
    howToApply: "अर्ज कसा करावा",
  }
};
