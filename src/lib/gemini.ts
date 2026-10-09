import studentsData from '@/data/students.json';
import facultyData from '@/data/faculty.json';
import roomsData from '@/data/rooms.json';
import wifiData from '@/data/wifi_access_points.json';
import eventsData from '@/data/events.json';
import holidaysData from '@/data/holidays.json';
import notesData from '@/data/notes.json';
import attendanceData from '@/data/attendance.json';
import busesData from '@/data/buses.json';
import { SupportedLanguage, UserRole } from '@/types';

export const CAMPUS_SYSTEM_PROMPT = `
You are the official Voice-First AI Campus Agent for Sapthagiri NPS University (SNPU), Bengaluru.
You assist students, faculty, parents, and campus visitors in 6 languages: English, Kannada (ಕನ್ನಡ), Hindi (हिन्दी), Telugu (తెలుగు), Tamil (தமிழ்), and Malayalam (മലയാളം).

Rules:
1. Respond concisely and warmly, optimized for speech/voice output.
2. If the user asks in or selected a specific language, respond in that language.
3. Live Faculty Locator: If asked about where a faculty member is (e.g., Dr. Geetha R., Prof. Manjunath Swamy, Dr. Kavitha, Dr. Harish Babu, Prof. Priya), use their current location, cabin, and Wi-Fi access point.
4. College Data:
- University: Sapthagiri NPS University (Hesaraghatta Main Road, Bangalore)
- Buses: 4 routes (Peenya, Yelahanka, Majestic/Malleshwaram, Rajajinagar)
- Departments: CSE, AIML, ISE, ECE, Mechanical, Biotechnology
- Flagship Event: SAPHACK 2026 (Oct 17, Rs 1.5 Lakh prize pool)
5. Attendance: VTU / autonomous policy requires minimum 75% (85% recommended).
6. If the user wants a reminder (e.g. "Remind me at 5 PM to submit assignment"), include [REMINDER: title | time | category] at the end of your response so the app automatically creates it.
`;

export interface AIResponsePayload {
  answer: string;
  language: SupportedLanguage;
  detectedReminder?: {
    title: string;
    datetime: string;
    category: 'class' | 'exam' | 'assignment' | 'bus' | 'event' | 'personal';
  };
  suggestedActions?: string[];
}

/**
 * Intelligent campus knowledge matcher (used when GEMINI_API_KEY is not set or offline)
 */
export function generateLocalCampusResponse(
  query: string,
  userRole: UserRole,
  userLang: SupportedLanguage,
  liveFaculty: typeof facultyData = facultyData
): AIResponsePayload {
  const q = query.toLowerCase();

  // 1. Check for Reminder requests
  if (q.includes('remind') || q.includes('reminder') || q.includes('ಜ್ಞಾಪನೆ') || q.includes('याद')) {
    const reminderTitle = query.replace(/remind me to|set a reminder for|reminder/gi, '').trim() || 'Campus Task';
    return {
      answer: userLang === 'kn'
        ? `ಖಂಡಿತ! ನಿಮ್ಮ ಜ್ಞಾಪನೆ "${reminderTitle}" ಅನ್ನು ಉಳಿಸಲಾಗಿದೆ.`
        : userLang === 'hi'
        ? `निश्चय ही! आपका रिमाइंडर "${reminderTitle}" सुरक्षित कर लिया गया है।`
        : `Got it! I have scheduled a reminder for "${reminderTitle}". You will find it in your Reminders tab.`,
      language: userLang,
      detectedReminder: {
        title: reminderTitle.slice(0, 50),
        datetime: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
        category: 'assignment',
      },
      suggestedActions: ['View Reminders', 'Where is Dr. Geetha?', 'Check Bus Timings'],
    };
  }

  // 2. Faculty location queries
  const facultyMatch = liveFaculty.find((f) =>
    q.includes(f.name.toLowerCase()) ||
    f.name.toLowerCase().split(' ').some((part) => part.length > 2 && q.includes(part)) ||
    (f.deptCode && q.includes(f.deptCode.toLowerCase()) && (q.includes('hod') || q.includes('dean')))
  );

  if (facultyMatch || q.includes('where is') || q.includes('faculty') || q.includes('cabin') || q.includes('ರೇಡಾರ್') || q.includes('कहाँ')) {
    const target = facultyMatch || liveFaculty[0]; // fallback to Dr. Geetha
    const status = target.status;
    const room = target.currentLocation.roomName;
    const bldg = target.currentLocation.building;
    const cabin = target.cabin;
    const wifi = target.currentLocation.wifiAp;

    let ans = '';
    if (userLang === 'kn') {
      ans = `${target.name} ಅವರು ಪ್ರಸ್ತುತ "${status}" ಸ್ಥಿತಿಯಲ್ಲಿದ್ದಾರೆ. ಸ್ಥಳ: ${bldg} ನ ${room} (ವೈ-ಫೈ: ${wifi}). ಅವರ ಕಾಯಂ ಕ್ಯಾಬಿನ್ ${cabin}. ಕಛೇರಿ ಭೇಟಿ ಸಮಯ: ${target.officeHours}.`;
    } else if (userLang === 'hi') {
      ans = `${target.name} वर्तमान में "${status}" हैं - स्थान: ${bldg}, ${room} (AP: ${wifi})। उनका केबिन ${cabin} में है। मिलने का समय: ${target.officeHours} है।`;
    } else {
      ans = `${target.name} is currently "${status}" at ${room}, ${bldg} (connected to ${wifi}). Regular Cabin: ${cabin}. Office hours: ${target.officeHours}.`;
    }

    return {
      answer: ans,
      language: userLang,
      suggestedActions: [
        `Check ${target.name}'s Schedule`,
        'Find Another Faculty',
        'Campus Map',
      ],
    };
  }

  // 3. Attendance queries
  if (q.includes('attendance') || q.includes('percentage') || q.includes('ಹಾಜರಾತಿ') || q.includes('उपस्थिति')) {
    const att = attendanceData[0];
    let ans = '';
    if (userLang === 'kn') {
      ans = `ನಿಮ್ಮ ಒಟ್ಟಾರೆ ಹಾಜರಾತಿ ${att.overallPercentage}%. ವೆಬ್ ಡೆವಲಪ್‌ಮೆಂಟ್: 91.6%, ಮೆಷಿನ್ ಲರ್ನಿಂಗ್: 85.3%, ಕ್ಲೌಡ್ ಕಂಪ್ಯೂಟಿಂಗ್: 78.5% (ಎಚ್ಚರಿಕೆ: ಕನಿಷ್ಠ 75% ಮಾನದಂಡದ ಹತ್ತಿರವಿದೆ).`;
    } else if (userLang === 'hi') {
      ans = `आपकी कुल उपस्थिति ${att.overallPercentage}% है। वेब डेवलपमेंट: 91.6%, एमएल: 85.3%, क्लाउड कंप्यूटिंग: 78.5% (चेतावनी: 75% थ्रेशोल्ड के करीब)।`;
    } else {
      ans = `Your overall attendance is ${att.overallPercentage}%. Web Dev: 91.6%, Machine Learning: 85.3%, Cloud Computing: 78.5% (Warning: close to VTU 75% threshold). AI Lab: 92.8%.`;
    }
    return {
      answer: ans,
      language: userLang,
      suggestedActions: ['View Subject Breakdown', 'Attendance Medical Leave Rules', 'Faculty Mentors'],
    };
  }

  // 4. Bus / Transport queries
  if (q.includes('bus') || q.includes('transport') || q.includes('route') || q.includes('majestic') || q.includes('ಬಸ್') || q.includes('बस')) {
    let ans = '';
    if (userLang === 'kn') {
      ans = `ಸಪ್ತಗಿರಿ ವಿವಿ 4 ಬಸ್ ಮಾರ್ಗಗಳನ್ನು ಹೊಂದಿದೆ: ಮಾರ್ಗ 1 (ಪೀಣ್ಯ), ಮಾರ್ಗ 2 (ಯಲಹಂಕ), ಮಾರ್ಗ 4 (ಮೆಜೆಸ್ಟಿಕ್/ಮಲ್ಲೇಶ್ವರಂ), ಮಾರ್ಗ 7 (ರಾಜಾಜಿನಗರ). ಎಲ್ಲಾ ಬಸ್‌ಗಳು ಸಂಜೆ 04:45 ಕ್ಕೆ ಗೇಟ್ 1 ರಿಂದ ಹೊರಡುತ್ತವೆ.`;
    } else if (userLang === 'hi') {
      ans = `सप्तगिरि यूनिवर्सिटी की 4 मुख्य बसें हैं: रूट 1 (पीण्या), रूट 2 (यलहंका), रूट 4 (मैजेस्टिक/मल्लेश्वरम), रूट 7 (राजाजीनगर)। शाम को सभी बसें 04:45 बजे गेट 1 से रवाना होती हैं।`;
    } else {
      ans = `Sapthagiri NPS University operates 4 main bus routes: Route 1 (Peenya), Route 2 (Yelahanka), Route 4 (Majestic & Malleshwaram), Route 7 (Rajajinagar). Morning arrival is 08:30 AM; evening departure from Gate 1 is 04:45 PM sharp.`;
    }
    return {
      answer: ans,
      language: userLang,
      suggestedActions: ['Route 4 Timings (Majestic)', 'Call Bus Driver', 'Track Live Bus'],
    };
  }

  // 5. Events / Hackathon queries
  if (q.includes('event') || q.includes('hackathon') || q.includes('saphack') || q.includes('fest') || q.includes('ಕಾರ್ಯಕ್ರಮ') || q.includes('इवेंट')) {
    const evt = eventsData[0];
    let ans = '';
    if (userLang === 'kn') {
      ans = `ಪ್ರಮುಖ ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮ: "${evt.title}". ದಿನಾಂಕ: ${evt.date}, ಸ್ಥಳ: ${evt.venue}. ಒಟ್ಟು ನಗದು ಬಹುಮಾನ: ₹1,50,000! ನೋಂದಣಿ ಪ್ರಕ್ರಿಯೆ ಚಾಲ್ತಿಯಲ್ಲಿದೆ.`;
    } else if (userLang === 'hi') {
      ans = `आगामी मुख्य कार्यक्रम: "${evt.title}". दिनांक: ${evt.date}, स्थान: ${evt.venue}. कुल नकद पुरस्कार: ₹1,50,000! रजिस्ट्रेशन अभी खुला है।`;
    } else {
      ans = `Upcoming flagship event: "${evt.title}" on ${evt.date} at ${evt.venue}. 36-hour hackathon on GenAI & Smart Cities with ₹1.5 Lakhs in cash prizes! SANKALPA 2026 Cultural Fest is on Nov 6th.`;
    }
    return {
      answer: ans,
      language: userLang,
      suggestedActions: ['Register for SAPHACK 2026', 'Robotics Workshop (Oct 12)', 'Cultural Fest Info'],
    };
  }

  // 6. Notes / Study material queries
  if (q.includes('notes') || q.includes('syllabus') || q.includes('material') || q.includes('study') || q.includes('ನೋಟ್ಸ್') || q.includes('नोट्स')) {
    let ans = '';
    if (userLang === 'kn') {
      ans = `ಮೆಷಿನ್ ಲರ್ನಿಂಗ್ (ಮಾಡ್ಯೂಲ್ 3 - ಡಿಸಿಷನ್ ಟ್ರೀಸ್) ನೋಟ್ಸ್ ಅನ್ನು ಡಾ. ಗೀತಾ ಅವರು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ್ದಾರೆ. ಫುಲ್ ಸ್ಟ್ಯಾಕ್ ವೆಬ್ ಡೆವ್ ನೋಟ್ಸ್ ಅನ್ನು ಪ್ರೊ. ಪ್ರಿಯಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ್ದಾರೆ. "Study Notes" ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.`;
    } else if (userLang === 'hi') {
      ans = `मशीन लर्निंग (मॉड्यूल 3 - डिसिजन ट्रीज) के नोट्स डॉ. गीता द्वारा अपलोड किए गए हैं। वेब डेवलपमेंट नोट्स प्रो. प्रिया द्वारा अपलोड हैं। आप इन्हें 'Study Notes' टैब से देख सकते हैं।`;
    } else {
      ans = `Module 3 Decision Trees notes for 21CS63 are uploaded by Dr. Geetha R. Next.js & Serverless notes for 21CS62 uploaded by Prof. Priya. Access them in the "Study Notes" tab.`;
    }
    return {
      answer: ans,
      language: userLang,
      suggestedActions: ['Download ML Module 3', 'Download Full Stack Notes', 'Question Banks'],
    };
  }

  // 7. Holidays queries
  if (q.includes('holiday') || q.includes('leave') || q.includes('calendar') || q.includes('ರಜೆ') || q.includes('छुट्टी')) {
    let ans = '';
    if (userLang === 'kn') {
      ans = `ಮುಂಬರುವ ರಜಾದಿನಗಳು: ಅಕ್ಟೋಬರ್ 20 ರಂದು ಆಯುಧ ಪೂಜೆ / ಮಹಾನವಮಿ, ಅಕ್ಟೋಬರ್ 21 ರಂದು ವಿಜಯದಶಮಿ (ದಸರಾ), ಮತ್ತು ನವೆಂಬರ್ 1 ರಂದು ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ.`;
    } else if (userLang === 'hi') {
      ans = `आगामी अवकाश: 20 अक्टूबर को महानवमी/आयुध पूजा, 21 अक्टूबर को विजयादशमी (दशहरा), और 1 नवंबर को कन्नड़ राज्योत्सव।`;
    } else {
      ans = `Upcoming holidays: Maha Navami / Ayudha Pooja on Oct 20, Vijayadashami (Dussehra) on Oct 21, and Kannada Rajyotsava on Nov 1st.`;
    }
    return {
      answer: ans,
      language: userLang,
      suggestedActions: ['Academic Calendar', 'Exam Time Table', 'Fee Payment Dates'],
    };
  }

  // Default welcome response
  let defaultAns = '';
  if (userLang === 'kn') {
    defaultAns = `ನಮಸ್ಕಾರ! ಸಪ್ತಗಿರಿ ಎನ್‌ಪಿಎಸ್ ವಿವಿ ಎಐ ಸಹಾಯಕನಿಗೆ ಸುಸ್ವಾಗತ. ನೀವು ಉಪನ್ಯಾಸಕರ ಲೈವ್ ರೇಡಾರ್, ಹಾಜರಾತಿ, ಬಸ್ ವೇಳಾಪಟ್ಟಿ, ನೋಟ್ಸ್ ಅಥವಾ ಮುಂಬರುವ ಹ್ಯಾಕಥಾನ್ ಬಗ್ಗೆ ಧ್ವನಿ ಮೂಲಕ ಕೇಳಬಹುದು.`;
  } else if (userLang === 'hi') {
    defaultAns = `नमस्ते! सप्तगिरि एनपीएस विश्वविद्यालय एआई सहायक में आपका स्वागत है। आप फैकल्टी लोकेशन, उपस्थिति, बस समय, अध्ययन सामग्री या हैकाथॉन के बारे में पूछ सकते हैं।`;
  } else {
    defaultAns = `Welcome to Sapthagiri NPS University AI Campus Agent! I can help you locate faculty live on campus via Wi-Fi radar, check your attendance, look up bus routes, access notes, or register for upcoming events. What would you like to know?`;
  }

  return {
    answer: defaultAns,
    language: userLang,
    suggestedActions: [
      'Where is Dr. Geetha right now?',
      'Check my attendance in OS and ML',
      'When is the next bus to Majestic?',
      'Tell me about SAPHACK 2026 hackathon',
    ],
  };
}
