"use client";

import FloatingNav from "@/app/components/FloatingNav";
import { useLocale } from "@/lib/i18n/context";

const sectionsEn = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using oDesigns ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service. These Terms constitute a legally binding agreement between you and oDesigns. Your continued use of the Service following any modifications to these Terms constitutes acceptance of those changes.`,
  },
  {
    title: "2. Description of Service",
    content: `oDesigns is an AI-powered social media post generator and design editor. The Service provides tools for generating social media posts using artificial intelligence, editing and customizing post designs with a visual editor, managing workspaces and brand assets, scheduling and publishing content across social media platforms, and exporting designs in various formats. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice.`,
  },
  {
    title: "3. User Accounts",
    content: `To access the Service, you must create an account using Google OAuth authentication. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to provide accurate and complete information during registration and to keep your account information up to date. You must notify us immediately of any unauthorized use of your account. oDesigns is not liable for any loss or damage arising from your failure to protect your account credentials.`,
  },
  {
    title: "4. Subscription & Billing",
    content: `oDesigns offers both free and paid subscription plans. Paid plans are billed on a recurring basis (monthly or annually) depending on the plan selected. By subscribing to a paid plan, you authorize oDesigns to charge the applicable fees to your chosen payment method. Subscription fees are non-refundable except as required by law. You may cancel your subscription at any time, and cancellation will take effect at the end of your current billing cycle. oDesigns reserves the right to change pricing with reasonable notice to subscribers.`,
  },
  {
    title: "5. User Content",
    content: `You retain full ownership of all content you create, upload, or generate through the Service ("User Content"). By using the Service, you grant oDesigns a limited, non-exclusive, worldwide, royalty-free license to use, store, and process your User Content solely for the purpose of operating and improving the Service. This license terminates when you delete your User Content or close your account. You are solely responsible for ensuring that your User Content does not violate any applicable laws or third-party rights.`,
  },
  {
    title: "6. AI-Generated Content",
    content: `The Service uses artificial intelligence to generate social media post designs and copy. AI-generated content is provided "as-is" and may not always be accurate, appropriate, or free of errors. You are solely responsible for reviewing, editing, and approving any AI-generated content before publishing or distributing it. oDesigns does not guarantee the originality, accuracy, or suitability of AI-generated content for any particular purpose. You acknowledge that similar or identical content may be generated for other users. oDesigns is not liable for any consequences arising from your use of AI-generated content.`,
  },
  {
    title: "7. Acceptable Use",
    content: `You agree not to use the Service to generate, distribute, or promote spam or unsolicited communications; create content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable; infringe upon the intellectual property rights of any third party; attempt to reverse engineer, decompile, or disassemble any part of the Service; interfere with or disrupt the Service or its infrastructure; use automated tools to scrape, crawl, or extract data from the Service; or share your account credentials with third parties or allow unauthorized access. Violation of these terms may result in immediate suspension or termination of your account.`,
  },
  {
    title: "8. Intellectual Property",
    content: `The Service, including its design, code, templates, AI models, and all associated intellectual property, is owned by oDesigns and protected by applicable intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service without prior written consent. The oDesigns name, logo, and branding are trademarks of oDesigns. Nothing in these Terms grants you any right to use oDesigns trademarks without express permission.`,
  },
  {
    title: "9. Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, oDesigns and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of or inability to use the Service. Our total liability for any claim arising from these Terms or the Service shall not exceed the amount you paid to oDesigns in the twelve months preceding the claim. Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so the above limitations may not apply to you.`,
  },
  {
    title: "10. Termination",
    content: `oDesigns may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will cease immediately. Provisions of these Terms that by their nature should survive termination shall remain in effect, including but not limited to ownership provisions, warranty disclaimers, and limitations of liability.`,
  },
  {
    title: "11. Changes to Terms",
    content: `We reserve the right to update or modify these Terms at any time. Material changes will be communicated through the Service or via the email address associated with your account. Your continued use of the Service after any changes constitutes acceptance of the revised Terms. We encourage you to review these Terms periodically to stay informed of any updates.`,
  },
  {
    title: "12. Contact",
    content: `If you have any questions or concerns about these Terms of Service, please contact us at hi@oagents.app.`,
  },
];

const sectionsAr = [
  {
    title: "١. قبول الشروط",
    content: `بالوصول إلى أو استخدام oDesigns ("الخدمة")، فإنك توافق على الالتزام بشروط الخدمة هذه ("الشروط"). إذا كنت لا توافق على هذه الشروط، فلا يجوز لك الوصول إلى الخدمة أو استخدامها. تشكل هذه الشروط اتفاقية ملزمة قانونيًا بينك وبين oDesigns. يعتبر استمرارك في استخدام الخدمة بعد أي تعديلات على هذه الشروط قبولاً لتلك التغييرات.`,
  },
  {
    title: "٢. وصف الخدمة",
    content: `oDesigns هي منصة مدعومة بالذكاء الاصطناعي لإنشاء منشورات وسائل التواصل الاجتماعي وتحرير التصاميم. توفر الخدمة أدوات لإنشاء منشورات وسائل التواصل الاجتماعي باستخدام الذكاء الاصطناعي، وتحرير وتخصيص تصاميم المنشورات بمحرر مرئي، وإدارة مساحات العمل وأصول العلامة التجارية، وجدولة ونشر المحتوى عبر منصات التواصل الاجتماعي، وتصدير التصاميم بتنسيقات متعددة. نحتفظ بالحق في تعديل أو تعليق أو إيقاف أي جانب من جوانب الخدمة في أي وقت دون إشعار مسبق.`,
  },
  {
    title: "٣. حسابات المستخدمين",
    content: `للوصول إلى الخدمة، يجب عليك إنشاء حساب باستخدام مصادقة Google OAuth. أنت مسؤول عن الحفاظ على سرية حسابك وعن جميع الأنشطة التي تحدث تحت حسابك. أنت توافق على تقديم معلومات دقيقة وكاملة أثناء التسجيل والحفاظ على تحديث معلومات حسابك. يجب عليك إخطارنا فورًا بأي استخدام غير مصرح به لحسابك. لا تتحمل oDesigns أي مسؤولية عن أي خسارة أو ضرر ناتج عن فشلك في حماية بيانات اعتماد حسابك.`,
  },
  {
    title: "٤. الاشتراك والفوترة",
    content: `تقدم oDesigns خطط اشتراك مجانية ومدفوعة. تُفوتر الخطط المدفوعة على أساس متكرر (شهريًا أو سنويًا) حسب الخطة المختارة. بالاشتراك في خطة مدفوعة، فإنك تفوض oDesigns بفرض الرسوم المطبقة على طريقة الدفع التي اخترتها. رسوم الاشتراك غير قابلة للاسترداد إلا بما يقتضيه القانون. يمكنك إلغاء اشتراكك في أي وقت، ويسري الإلغاء في نهاية دورة الفوترة الحالية. تحتفظ oDesigns بالحق في تغيير الأسعار مع إشعار معقول للمشتركين.`,
  },
  {
    title: "٥. محتوى المستخدم",
    content: `تحتفظ بالملكية الكاملة لجميع المحتوى الذي تنشئه أو ترفعه أو تولّده من خلال الخدمة ("محتوى المستخدم"). باستخدام الخدمة، فإنك تمنح oDesigns ترخيصًا محدودًا وغير حصري وعالميًا وبدون رسوم لاستخدام محتوى المستخدم الخاص بك وتخزينه ومعالجته فقط لغرض تشغيل الخدمة وتحسينها. ينتهي هذا الترخيص عند حذف محتوى المستخدم الخاص بك أو إغلاق حسابك. أنت وحدك المسؤول عن ضمان عدم انتهاك محتوى المستخدم الخاص بك لأي قوانين سارية أو حقوق أطراف ثالثة.`,
  },
  {
    title: "٦. المحتوى المُنشأ بالذكاء الاصطناعي",
    content: `تستخدم الخدمة الذكاء الاصطناعي لإنشاء تصاميم ونصوص منشورات وسائل التواصل الاجتماعي. يُقدم المحتوى المُنشأ بالذكاء الاصطناعي "كما هو" وقد لا يكون دائمًا دقيقًا أو مناسبًا أو خاليًا من الأخطاء. أنت وحدك المسؤول عن مراجعة وتحرير والموافقة على أي محتوى مُنشأ بالذكاء الاصطناعي قبل نشره أو توزيعه. لا تضمن oDesigns أصالة أو دقة أو ملاءمة المحتوى المُنشأ بالذكاء الاصطناعي لأي غرض معين. أنت تقر بأن محتوى مشابهًا أو مطابقًا قد يُنشأ لمستخدمين آخرين. لا تتحمل oDesigns أي مسؤولية عن أي عواقب ناتجة عن استخدامك للمحتوى المُنشأ بالذكاء الاصطناعي.`,
  },
  {
    title: "٧. الاستخدام المقبول",
    content: `أنت توافق على عدم استخدام الخدمة لإنشاء أو توزيع أو الترويج للرسائل غير المرغوب فيها أو الاتصالات غير المطلوبة؛ إنشاء محتوى غير قانوني أو ضار أو مهدد أو مسيء أو تشهيري أو مرفوض بأي شكل آخر؛ انتهاك حقوق الملكية الفكرية لأي طرف ثالث؛ محاولة الهندسة العكسية أو فك تجميع أو تفكيك أي جزء من الخدمة؛ التدخل في الخدمة أو بنيتها التحتية أو تعطيلها؛ استخدام أدوات آلية لاستخراج البيانات من الخدمة؛ أو مشاركة بيانات اعتماد حسابك مع أطراف ثالثة أو السماح بالوصول غير المصرح به. قد يؤدي انتهاك هذه الشروط إلى تعليق أو إنهاء حسابك فورًا.`,
  },
  {
    title: "٨. الملكية الفكرية",
    content: `الخدمة، بما في ذلك تصميمها وكودها وقوالبها ونماذج الذكاء الاصطناعي وجميع الملكية الفكرية المرتبطة بها، مملوكة لـ oDesigns ومحمية بقوانين الملكية الفكرية المعمول بها. لا يجوز لك نسخ أو تعديل أو توزيع أو بيع أو تأجير أي جزء من الخدمة دون موافقة خطية مسبقة. اسم oDesigns وشعارها وعلامتها التجارية هي علامات تجارية لـ oDesigns. لا يمنحك أي شيء في هذه الشروط أي حق في استخدام علامات oDesigns التجارية دون إذن صريح.`,
  },
  {
    title: "٩. تحديد المسؤولية",
    content: `إلى أقصى حد يسمح به القانون المعمول به، لا تتحمل oDesigns ومسؤولوها ومديروها وموظفوها ووكلاؤها أي مسؤولية عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية، بما في ذلك على سبيل المثال لا الحصر خسارة الأرباح أو البيانات أو الفرص التجارية، الناتجة عن استخدامك للخدمة أو عدم قدرتك على استخدامها. لا تتجاوز مسؤوليتنا الإجمالية عن أي مطالبة ناشئة عن هذه الشروط أو الخدمة المبلغ الذي دفعته لـ oDesigns في الاثني عشر شهرًا السابقة للمطالبة. لا تسمح بعض الولايات القضائية باستبعاد ضمانات معينة أو تحديد المسؤولية، لذا قد لا تنطبق القيود المذكورة أعلاه عليك.`,
  },
  {
    title: "١٠. الإنهاء",
    content: `يجوز لـ oDesigns تعليق أو إنهاء وصولك إلى الخدمة في أي وقت، بسبب أو بدون سبب، ومع أو بدون إشعار. يمكنك إنهاء حسابك في أي وقت عن طريق التواصل معنا. عند الإنهاء، يتوقف حقك في استخدام الخدمة فورًا. تظل أحكام هذه الشروط التي بطبيعتها يجب أن تستمر بعد الإنهاء سارية المفعول، بما في ذلك على سبيل المثال لا الحصر أحكام الملكية وإخلاء المسؤولية من الضمانات وتحديدات المسؤولية.`,
  },
  {
    title: "١١. التغييرات على الشروط",
    content: `نحتفظ بالحق في تحديث أو تعديل هذه الشروط في أي وقت. سيتم إبلاغ التغييرات الجوهرية من خلال الخدمة أو عبر عنوان البريد الإلكتروني المرتبط بحسابك. يعتبر استمرارك في استخدام الخدمة بعد أي تغييرات قبولاً للشروط المعدلة. نشجعك على مراجعة هذه الشروط بشكل دوري للبقاء على اطلاع بأي تحديثات.`,
  },
  {
    title: "١٢. التواصل",
    content: `إذا كانت لديك أي أسئلة أو مخاوف بشأن شروط الخدمة هذه، يرجى التواصل معنا على hi@oagents.app.`,
  },
];

export default function TermsPage() {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";
  const sections = isAr ? sectionsAr : sectionsEn;

  return (
    <div dir={dir} className="min-h-screen bg-[#0a0a0a] text-white">
      <FloatingNav activePage="home" />

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4">
            {isAr ? "قانوني" : "Legal"}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {isAr ? "شروط الخدمة" : "Terms of Service"}
          </h1>
          <p className="text-neutral-400 text-lg">
            {isAr ? "آخر تحديث: مارس ٢٠٢٦" : "Last updated: March 2026"}
          </p>
        </div>

        {/* Introduction */}
        <p className="text-neutral-300 leading-relaxed mb-12 text-[15px]">
          {isAr
            ? "مرحبًا بك في oDesigns. تحكم شروط الخدمة هذه وصولك إلى واستخدامك لمنصتنا المدعومة بالذكاء الاصطناعي لإنشاء منشورات وسائل التواصل الاجتماعي وتحرير التصاميم. يرجى قراءة هذه الشروط بعناية قبل استخدام الخدمة."
            : "Welcome to oDesigns. These Terms of Service govern your access to and use of our AI-powered social media post generator and design editor platform. Please read these terms carefully before using the Service."}
        </p>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold mb-3 text-white">
                {section.title}
              </h2>
              <p className="text-neutral-400 leading-relaxed text-[15px]">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Footer divider */}
        <div className="mt-20 pt-8 border-t border-neutral-800">
          <p className="text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} oDesigns.{" "}
            {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </div>
    </div>
  );
}
