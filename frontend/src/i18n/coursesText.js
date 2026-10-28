// New text for courses, checkout and reviews. Imported once in main.jsx, it adds to the existing translations.
import { translations } from "./translations";

const add = {
  en: {
    nav: { courses: "Courses", reviews: "Reviews" },
    courses: {
      title: "Courses you can buy now",
      subtitle: "Pick a course, pay online or in cash, and start learning with our engineers.",
      buy: "Buy now",
      empty: "New courses are coming soon.",
    },
    checkout: {
      title: "Buy course",
      total: "Total",
      method: "Payment method",
      card: "Pay online",
      cardHint: "Card via secure payment page",
      cash: "Pay cash",
      cashHint: "Pay when we contact you",
      pay: "Continue to payment",
      confirm: "Confirm order",
      cancel: "Cancel",
      doneTitle: "Order received",
      doneText: "Our team will contact you to arrange cash payment and your access.",
      freeText: "Course access instructions have been sent to your email.",
      close: "Close",
      noLink: "The payment page could not be opened. Please try again.",
    },
    reviews: {
      title: "What our clients say",
      subtitle: "Real feedback from people we have worked with.",
    },
    payment: {
      successTitle: "Payment successful",
      successText: "Thank you! Your course access will be sent to you shortly.",
      cancelTitle: "Payment cancelled",
      cancelText: "No money was taken. You can try again any time.",
      back: "Back to courses",
    },
  },
  ar: {
    nav: { courses: "الكورسات", reviews: "آراء العملاء" },
    courses: {
      title: "كورسات تقدر تشتريها دلوقتي",
      subtitle: "اختار الكورس، ادفع أونلاين أو كاش، وابدأ التعلم مع مهندسينا.",
      buy: "اشترِ الآن",
      empty: "كورسات جديدة قريبًا.",
    },
    checkout: {
      title: "شراء الكورس",
      total: "الإجمالي",
      method: "طريقة الدفع",
      card: "دفع أونلاين",
      cardHint: "بالكارت من صفحة دفع آمنة",
      cash: "دفع كاش",
      cashHint: "تدفع لما نتواصل معاك",
      pay: "المتابعة للدفع",
      confirm: "تأكيد الطلب",
      cancel: "إلغاء",
      doneTitle: "تم استلام طلبك",
      doneText: "فريقنا هيتواصل معاك لترتيب الدفع كاش وتفعيل الكورس.",
      freeText: "تم إرسال تعليمات الدخول للكورس إلى بريدك الإلكتروني.",
      close: "إغلاق",
      noLink: "تعذر فتح صفحة الدفع. حاول مرة أخرى.",
    },
    reviews: {
      title: "آراء عملائنا",
      subtitle: "تقييمات حقيقية من ناس اشتغلنا معاهم.",
    },
    payment: {
      successTitle: "تم الدفع بنجاح",
      successText: "شكرًا لك! هيوصلك الدخول للكورس قريبًا.",
      cancelTitle: "تم إلغاء الدفع",
      cancelText: "ماتم خصم أي مبلغ. تقدر تحاول تاني في أي وقت.",
      back: "الرجوع للكورسات",
    },
  },
};

for (const lang of Object.keys(add)) {
  for (const [group, values] of Object.entries(add[lang])) {
    translations[lang][group] = { ...translations[lang][group], ...values };
  }
}
