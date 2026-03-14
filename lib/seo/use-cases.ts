export interface UseCaseContent {
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  painPoints: { title: string; description: string }[];
  features: { title: string; description: string }[];
  cta: { title: string; subtitle: string };
}

export interface UseCase extends UseCaseContent {
  slug: string;
  keywords: string[];
  features: { title: string; description: string; icon: string }[];
  locales?: Partial<Record<string, UseCaseContent>>;
}

export const useCases: UseCase[] = [
  {
    slug: "small-business-owners",
    title: "Social Media Design for Small Businesses",
    metaTitle:
      "AI Social Media Design Tool for Small Businesses | oDesigns",
    metaDescription:
      "Create professional social media posts without a designer. AI generates on-brand Instagram, Facebook, and Twitter posts for your small business in seconds.",
    keywords: [
      "small business social media",
      "social media design tool small business",
      "AI post generator small business",
      "affordable social media design",
      "small business Instagram posts",
    ],
    heroTitle: "Professional social media posts — without the agency price tag",
    heroSubtitle:
      "Small businesses need a consistent social media presence but can not afford a full-time designer. oDesigns generates on-brand posts in seconds so you can focus on running your business.",
    painPoints: [
      {
        title: "No design skills required",
        description:
          "You started a business, not a design studio. oDesigns uses AI to create professional-quality posts that match your brand — no Photoshop or Canva skills needed.",
      },
      {
        title: "Hours saved every week",
        description:
          "Stop spending evenings crafting social media posts. Describe what you want, and AI generates multiple design variations in under a minute. Batch a full week of content in one sitting.",
      },
      {
        title: "Consistent brand look",
        description:
          "Set your brand colors, fonts, and logo once. Every AI-generated post automatically uses your brand identity, making your feed look like it was designed by a professional.",
      },
    ],
    features: [
      {
        title: "AI post generation",
        description:
          "Describe your product, promotion, or message. AI creates multiple post designs tailored to your brand.",
        icon: "Sparkles",
      },
      {
        title: "Multi-platform publishing",
        description:
          "Publish to Instagram, Facebook, Threads, and Twitter from one dashboard. No more switching between apps.",
        icon: "Share2",
      },
      {
        title: "Brand kit",
        description:
          "Upload your logo, set your colors and fonts. Every post stays on-brand automatically.",
        icon: "Palette",
      },
      {
        title: "Bulk scheduling",
        description:
          "Schedule a full week of posts in minutes. Set it and forget it — your social media runs on autopilot.",
        icon: "CalendarDays",
      },
    ],
    cta: {
      title: "Start creating professional posts today",
      subtitle:
        "Join thousands of small businesses using AI to maintain a professional social media presence. Free to start.",
    },
    locales: {
      ar: {
        title: "تصميم سوشيال ميديا للشركات الصغيرة",
        metaTitle: "أداة تصميم سوشيال ميديا بالذكاء الاصطناعي للشركات الصغيرة | oDesigns",
        metaDescription: "أنشئ منشورات سوشيال ميديا احترافية بدون مصمم. الذكاء الاصطناعي يولّد منشورات متوافقة مع هويتك لإنستغرام وفيسبوك وتويتر في ثوانٍ.",
        heroTitle: "منشورات سوشيال ميديا احترافية — بدون تكلفة الوكالات",
        heroSubtitle: "الشركات الصغيرة تحتاج حضوراً ثابتاً على السوشيال ميديا لكن لا تستطيع تحمّل تكلفة مصمم متفرّغ. oDesigns يولّد منشورات متوافقة مع هويتك في ثوانٍ.",
        painPoints: [
          { title: "لا تحتاج مهارات تصميم", description: "oDesigns يستخدم الذكاء الاصطناعي لإنشاء منشورات احترافية تتوافق مع علامتك التجارية — بدون فوتوشوب أو كانفا." },
          { title: "ساعات موفّرة كل أسبوع", description: "صِف ما تريد، والذكاء الاصطناعي يولّد تصاميم متعددة في أقل من دقيقة. أنشئ محتوى أسبوع كامل في جلسة واحدة." },
          { title: "مظهر متسق للعلامة التجارية", description: "حدد ألوان وخطوط وشعار علامتك التجارية مرة واحدة. كل منشور مولّد يستخدم هويتك تلقائياً." },
        ],
        features: [
          { title: "توليد المنشورات بالذكاء الاصطناعي", description: "صِف منتجك أو عرضك. الذكاء الاصطناعي ينشئ تصاميم متعددة مخصصة لعلامتك التجارية." },
          { title: "النشر على منصات متعددة", description: "انشر على إنستغرام وفيسبوك وثريدز وتويتر من لوحة تحكم واحدة." },
          { title: "الهوية البصرية", description: "ارفع شعارك، حدد ألوانك وخطوطك. كل منشور يبقى متوافقاً مع هويتك تلقائياً." },
          { title: "الجدولة المجمّعة", description: "جدوِل أسبوعاً كاملاً من المنشورات في دقائق. سوشيال ميديا تعمل تلقائياً." },
        ],
        cta: { title: "ابدأ بإنشاء منشورات احترافية اليوم", subtitle: "انضم لآلاف الشركات الصغيرة التي تستخدم الذكاء الاصطناعي. مجاني للبدء." },
      },
    },
  },
  {
    slug: "real-estate-agents",
    title: "Social Media Marketing for Real Estate Agents",
    metaTitle:
      "AI Social Media Posts for Real Estate Agents | oDesigns",
    metaDescription:
      "Generate stunning property listing posts, open house announcements, and real estate marketing content with AI. Stand out on Instagram and Facebook.",
    keywords: [
      "real estate social media posts",
      "real estate Instagram marketing",
      "property listing social media",
      "real estate agent marketing tool",
      "AI real estate post generator",
    ],
    heroTitle: "Turn listings into scroll-stopping social media posts",
    heroSubtitle:
      "Real estate moves fast. Your social media should too. Generate professional property posts, open house announcements, and market updates in seconds — not hours.",
    painPoints: [
      {
        title: "Listings go live faster",
        description:
          "New listing? Generate a polished social media post in seconds. Upload a property photo, add the details, and AI creates multiple design variations ready to publish across all your channels.",
      },
      {
        title: "Stand out in a crowded market",
        description:
          "Every agent posts listings. The ones who get noticed use consistent, professional branding. oDesigns ensures every post matches your personal brand — building recognition and trust.",
      },
      {
        title: "More time for clients",
        description:
          "Stop spending hours creating marketing materials. Batch your social media content for the week in one sitting and spend the rest of your time closing deals.",
      },
    ],
    features: [
      {
        title: "Property showcase posts",
        description:
          "AI generates beautiful listing posts with property details, pricing, and your contact info — ready for Instagram and Facebook.",
        icon: "Home",
      },
      {
        title: "Scheduled open house posts",
        description:
          "Create and schedule open house announcements, reminders, and follow-ups automatically across all platforms.",
        icon: "CalendarDays",
      },
      {
        title: "Personal brand consistency",
        description:
          "Set your headshot, brand colors, and brokerage logo. Every post reinforces your professional identity.",
        icon: "Palette",
      },
      {
        title: "Market update content",
        description:
          "Position yourself as a local expert with AI-generated market insight posts that keep your audience engaged between listings.",
        icon: "TrendingUp",
      },
    ],
    cta: {
      title: "Start marketing your listings smarter",
      subtitle:
        "Join real estate professionals using AI to create listing posts, open house content, and market updates. Free to start.",
    },
    locales: {
      ar: {
        title: "تسويق عقاري عبر السوشيال ميديا",
        metaTitle: "منشورات سوشيال ميديا بالذكاء الاصطناعي للوكلاء العقاريين | oDesigns",
        metaDescription: "أنشئ منشورات عقارية مذهلة وإعلانات يوم مفتوح ومحتوى تسويقي بالذكاء الاصطناعي. تميّز على إنستغرام وفيسبوك.",
        heroTitle: "حوّل العقارات إلى منشورات توقف التمرير",
        heroSubtitle: "العقارات تتحرك بسرعة. سوشيال ميديا يجب أن تواكبها. أنشئ منشورات عقارية احترافية وإعلانات يوم مفتوح في ثوانٍ.",
        painPoints: [
          { title: "العقارات تُنشر أسرع", description: "عقار جديد؟ أنشئ منشوراً احترافياً في ثوانٍ. ارفع صور العقار وأضف التفاصيل، والذكاء الاصطناعي ينشئ تصاميم متعددة." },
          { title: "تميّز في سوق مزدحم", description: "كل وكيل ينشر عقارات. الذين يلفتون الانتباه يستخدمون هوية بصرية احترافية متسقة. oDesigns يضمن تطابق كل منشور مع علامتك." },
          { title: "وقت أكثر للعملاء", description: "توقف عن قضاء ساعات في إنشاء مواد تسويقية. أنشئ محتوى أسبوع كامل في جلسة واحدة واقضِ باقي وقتك في إتمام الصفقات." },
        ],
        features: [
          { title: "منشورات عرض العقارات", description: "الذكاء الاصطناعي ينشئ منشورات جميلة بتفاصيل العقار والأسعار ومعلومات التواصل." },
          { title: "منشورات يوم مفتوح مجدولة", description: "أنشئ وجدوِل إعلانات اليوم المفتوح والتذكيرات تلقائياً عبر جميع المنصات." },
          { title: "اتساق العلامة الشخصية", description: "حدد صورتك وألوان علامتك وشعار الوساطة. كل منشور يعزز هويتك المهنية." },
          { title: "محتوى تحديثات السوق", description: "ضع نفسك كخبير محلي بمنشورات تحليلات السوق المولّدة بالذكاء الاصطناعي." },
        ],
        cta: { title: "ابدأ تسويق عقاراتك بذكاء", subtitle: "انضم للمحترفين العقاريين الذين يستخدمون الذكاء الاصطناعي. مجاني للبدء." },
      },
    },
  },
  {
    slug: "restaurants-and-cafes",
    title: "Social Media Design for Restaurants and Cafes",
    metaTitle:
      "AI Social Media Posts for Restaurants & Cafes | oDesigns",
    metaDescription:
      "Create mouth-watering social media posts for your restaurant or cafe. AI generates menu highlights, promotions, and food photography posts in seconds.",
    keywords: [
      "restaurant social media posts",
      "cafe Instagram marketing",
      "food social media design",
      "restaurant marketing tool",
      "AI food post generator",
    ],
    heroTitle: "Make your menu the star of every feed",
    heroSubtitle:
      "Great food deserves great presentation — online and offline. Generate stunning menu posts, daily specials, and seasonal promotions that make followers hungry.",
    painPoints: [
      {
        title: "Daily specials, instantly posted",
        description:
          "Changed the menu today? Generate a beautiful post in seconds. AI creates designs that showcase your dishes with the same care you put into cooking them.",
      },
      {
        title: "Seasonal campaigns made easy",
        description:
          "Ramadan menu, summer drinks, holiday specials — generate an entire campaign of posts in one session. Schedule them across the season and focus on your kitchen.",
      },
      {
        title: "Consistent food branding",
        description:
          "Your restaurant has a vibe. Your social media should match. Set your brand identity once, and every post — from breakfast promos to late-night offers — looks like it belongs.",
      },
    ],
    features: [
      {
        title: "Menu highlight posts",
        description:
          "Showcase your best dishes with AI-generated designs that combine food photography with appetizing typography and your brand colors.",
        icon: "UtensilsCrossed",
      },
      {
        title: "Promotion and offer posts",
        description:
          "Happy hour, lunch deals, catering packages — generate professional promotional posts that drive foot traffic.",
        icon: "Tag",
      },
      {
        title: "Multi-location support",
        description:
          "Managing multiple locations? Create location-specific content from one dashboard with workspace-level brand settings.",
        icon: "MapPin",
      },
      {
        title: "Schedule across platforms",
        description:
          "Post to Instagram, Facebook, and more from one place. Schedule a week of food content in minutes.",
        icon: "CalendarDays",
      },
    ],
    cta: {
      title: "Start showcasing your menu today",
      subtitle:
        "Join restaurants and cafes using AI to create stunning food posts and promotions. Free to start.",
    },
    locales: {
      ar: {
        title: "تصميم سوشيال ميديا للمطاعم والكافيهات",
        metaTitle: "منشورات سوشيال ميديا بالذكاء الاصطناعي للمطاعم والكافيهات | oDesigns",
        metaDescription: "أنشئ منشورات سوشيال ميديا شهية لمطعمك أو كافيهك. الذكاء الاصطناعي يولّد تصاميم للقوائم والعروض اليومية والترويج الموسمي في ثوانٍ.",
        heroTitle: "اجعل قائمتك نجمة كل موجز",
        heroSubtitle: "الطعام الرائع يستحق عرضاً رائعاً. أنشئ منشورات قوائم مذهلة وعروض يومية وترويج موسمي يجعل المتابعين يشعرون بالجوع.",
        painPoints: [
          { title: "العروض اليومية تُنشر فوراً", description: "غيّرت القائمة اليوم؟ أنشئ منشوراً جميلاً في ثوانٍ. الذكاء الاصطناعي يصمم أطباقك بنفس العناية التي تضعها في طهيها." },
          { title: "الحملات الموسمية بسهولة", description: "قائمة رمضان، مشروبات الصيف، عروض الأعياد — أنشئ حملة كاملة في جلسة واحدة. جدوِلها وركّز على مطبخك." },
          { title: "هوية بصرية متسقة للطعام", description: "مطعمك له أجواؤه. سوشيال ميديا يجب أن تتطابق. حدد هويتك مرة واحدة وكل منشور سيبدو متناسقاً." },
        ],
        features: [
          { title: "منشورات إبراز القائمة", description: "اعرض أفضل أطباقك بتصاميم تجمع تصوير الطعام مع الطباعة الشهية وألوان علامتك." },
          { title: "منشورات العروض والترويج", description: "ساعة سعيدة، عروض الغداء، باقات التموين — أنشئ منشورات ترويجية احترافية تجذب الزبائن." },
          { title: "دعم المواقع المتعددة", description: "تدير عدة فروع؟ أنشئ محتوى خاصاً بكل موقع من لوحة تحكم واحدة." },
          { title: "الجدولة عبر المنصات", description: "انشر على إنستغرام وفيسبوك وأكثر من مكان واحد. جدوِل أسبوع من محتوى الطعام في دقائق." },
        ],
        cta: { title: "ابدأ بعرض قائمتك اليوم", subtitle: "انضم للمطاعم والكافيهات التي تستخدم الذكاء الاصطناعي. مجاني للبدء." },
      },
    },
  },
  {
    slug: "freelance-designers",
    title: "Social Media Automation for Freelance Designers",
    metaTitle:
      "AI Social Media Tool for Freelance Designers | oDesigns",
    metaDescription:
      "Automate your social media presence as a freelancer. Generate portfolio showcases, client work highlights, and personal brand content with AI.",
    keywords: [
      "freelancer social media tool",
      "designer social media automation",
      "freelance portfolio posts",
      "personal brand social media",
      "AI content for freelancers",
    ],
    heroTitle: "Your portfolio, everywhere — without the extra work",
    heroSubtitle:
      "You design for clients all day. The last thing you want is to spend your evenings designing your own social media. Let AI handle your online presence while you focus on billable work.",
    painPoints: [
      {
        title: "Portfolio posts on autopilot",
        description:
          "Finished a client project? Generate a beautiful case study post in seconds. Showcase your work consistently without carving hours out of your schedule.",
      },
      {
        title: "Build your personal brand",
        description:
          "The freelancers who win clients are the ones who stay visible. Maintain a professional social media presence with scheduled, on-brand posts — even during busy seasons.",
      },
      {
        title: "One tool, all platforms",
        description:
          "Stop designing separate posts for Instagram, Twitter, and LinkedIn. Create once, adapt to every platform automatically, and publish from one dashboard.",
      },
    ],
    features: [
      {
        title: "Portfolio showcase posts",
        description:
          "Turn screenshots and project details into polished portfolio posts that attract new clients.",
        icon: "Image",
      },
      {
        title: "Personal brand kit",
        description:
          "Set your signature style — colors, fonts, logo. Every generated post reinforces your professional identity.",
        icon: "Palette",
      },
      {
        title: "Batch content creation",
        description:
          "Generate a month of social media content in one session. Schedule it all and get back to client work.",
        icon: "Layers",
      },
      {
        title: "Multi-platform publishing",
        description:
          "Post to Instagram, Twitter, Threads, and Facebook simultaneously. Reach clients wherever they are.",
        icon: "Share2",
      },
    ],
    cta: {
      title: "Automate your social media presence",
      subtitle:
        "Join freelancers using AI to maintain a professional online presence. Free to start — no design work required.",
    },
    locales: {
      ar: {
        title: "أتمتة السوشيال ميديا للمصممين المستقلين",
        metaTitle: "أداة سوشيال ميديا بالذكاء الاصطناعي للمصممين المستقلين | oDesigns",
        metaDescription: "أتمت حضورك على السوشيال ميديا كمستقل. أنشئ عروض أعمالك ومحتوى علامتك الشخصية بالذكاء الاصطناعي.",
        heroTitle: "معرض أعمالك في كل مكان — بدون جهد إضافي",
        heroSubtitle: "تصمم للعملاء طوال اليوم. آخر شيء تريده هو قضاء أمسياتك في تصميم سوشيال ميديا خاصة بك. دع الذكاء الاصطناعي يتولى حضورك الرقمي.",
        painPoints: [
          { title: "منشورات معرض الأعمال تلقائياً", description: "أنهيت مشروعاً للعميل؟ أنشئ منشور دراسة حالة جميل في ثوانٍ. اعرض أعمالك باستمرار بدون اقتطاع ساعات من جدولك." },
          { title: "ابنِ علامتك الشخصية", description: "المستقلون الذين يكسبون العملاء هم الذين يبقون مرئيين. حافظ على حضور احترافي بمنشورات مجدولة ومتوافقة مع هويتك." },
          { title: "أداة واحدة، كل المنصات", description: "توقف عن تصميم منشورات منفصلة لكل منصة. صمم مرة واحدة وانشر من لوحة تحكم واحدة." },
        ],
        features: [
          { title: "منشورات عرض الأعمال", description: "حوّل لقطات الشاشة وتفاصيل المشاريع إلى منشورات معرض أعمال مصقولة تجذب عملاء جدد." },
          { title: "الهوية البصرية الشخصية", description: "حدد أسلوبك المميز — الألوان والخطوط والشعار. كل منشور مولّد يعزز هويتك المهنية." },
          { title: "إنشاء المحتوى بالجملة", description: "أنشئ شهراً من محتوى السوشيال ميديا في جلسة واحدة. جدوِله وعُد لعمل العملاء." },
          { title: "النشر على منصات متعددة", description: "انشر على إنستغرام وتويتر وثريدز وفيسبوك في وقت واحد." },
        ],
        cta: { title: "أتمت حضورك على السوشيال ميديا", subtitle: "انضم للمستقلين الذين يستخدمون الذكاء الاصطناعي. مجاني للبدء." },
      },
    },
  },
  {
    slug: "ecommerce-brands",
    title: "Social Media Marketing for E-Commerce Brands",
    metaTitle:
      "AI Social Media Posts for E-Commerce & Online Stores | oDesigns",
    metaDescription:
      "Generate product launch posts, sale announcements, and e-commerce marketing content with AI. Drive traffic from Instagram and Facebook to your online store.",
    keywords: [
      "ecommerce social media marketing",
      "product launch social media posts",
      "online store Instagram marketing",
      "AI ecommerce post generator",
      "social media for online stores",
    ],
    heroTitle: "Turn products into posts that drive sales",
    heroSubtitle:
      "Your products look great in your store. Make them look just as good on social media. Generate product posts, sale announcements, and seasonal campaigns that drive traffic and conversions.",
    painPoints: [
      {
        title: "Product launch posts in seconds",
        description:
          "New product drop? Generate launch announcements, teaser posts, and feature highlights instantly. AI creates multiple design variations so you can pick the best one.",
      },
      {
        title: "Sale campaigns at scale",
        description:
          "Flash sales, seasonal clearance, bundle deals — generate an entire promotional campaign in one session. Schedule posts to build anticipation before, during, and after the sale.",
      },
      {
        title: "Consistent catalog aesthetic",
        description:
          "Every product post should feel like part of the same brand. Your brand kit ensures visual consistency across hundreds of product posts without manual design work.",
      },
    ],
    features: [
      {
        title: "Product showcase posts",
        description:
          "Upload product images and let AI create stunning social media posts with pricing, features, and your brand styling.",
        icon: "ShoppingBag",
      },
      {
        title: "Sale and promotion designs",
        description:
          "Generate eye-catching sale banners, countdown posts, and limited-time offer announcements that create urgency.",
        icon: "Tag",
      },
      {
        title: "Multi-platform publishing",
        description:
          "Publish product posts to Instagram, Facebook, Twitter, and Threads simultaneously to maximize reach.",
        icon: "Share2",
      },
      {
        title: "Bulk scheduling",
        description:
          "Schedule an entire product launch campaign across platforms in minutes. Plan weeks of content in one session.",
        icon: "CalendarDays",
      },
    ],
    cta: {
      title: "Start marketing your products smarter",
      subtitle:
        "Join e-commerce brands using AI to create product posts and drive social media sales. Free to start.",
    },
    locales: {
      ar: {
        title: "تسويق سوشيال ميديا للمتاجر الإلكترونية",
        metaTitle: "منشورات سوشيال ميديا بالذكاء الاصطناعي للمتاجر الإلكترونية | oDesigns",
        metaDescription: "أنشئ منشورات إطلاق المنتجات وإعلانات التخفيضات ومحتوى التسويق الإلكتروني بالذكاء الاصطناعي. جذب الزوار من إنستغرام وفيسبوك لمتجرك.",
        heroTitle: "حوّل المنتجات إلى منشورات تحقق مبيعات",
        heroSubtitle: "منتجاتك تبدو رائعة في متجرك. اجعلها تبدو بنفس الروعة على السوشيال ميديا. أنشئ منشورات المنتجات والتخفيضات والحملات الموسمية.",
        painPoints: [
          { title: "منشورات إطلاق المنتجات في ثوانٍ", description: "منتج جديد؟ أنشئ إعلانات الإطلاق ومنشورات التشويق وإبراز الميزات فوراً. الذكاء الاصطناعي ينشئ تنويعات تصميمية متعددة." },
          { title: "حملات التخفيضات على نطاق واسع", description: "تخفيضات سريعة، تصفية موسمية، عروض الباقات — أنشئ حملة ترويجية كاملة في جلسة واحدة وجدوِلها." },
          { title: "جمالية كتالوج متسقة", description: "كل منشور منتج يجب أن يبدو جزءاً من نفس العلامة التجارية. هويتك البصرية تضمن الاتساق البصري عبر مئات المنشورات." },
        ],
        features: [
          { title: "منشورات عرض المنتجات", description: "ارفع صور المنتجات ودع الذكاء الاصطناعي ينشئ منشورات مذهلة بالأسعار والميزات وتصميم علامتك." },
          { title: "تصاميم التخفيضات والعروض", description: "أنشئ لافتات تخفيضات جذابة ومنشورات عد تنازلي وإعلانات عروض محدودة تخلق إلحاحاً." },
          { title: "النشر على منصات متعددة", description: "انشر منشورات المنتجات على إنستغرام وفيسبوك وتويتر وثريدز في وقت واحد." },
          { title: "الجدولة المجمّعة", description: "جدوِل حملة إطلاق منتج كاملة عبر المنصات في دقائق." },
        ],
        cta: { title: "ابدأ تسويق منتجاتك بذكاء", subtitle: "انضم للعلامات التجارية الإلكترونية التي تستخدم الذكاء الاصطناعي. مجاني للبدء." },
      },
    },
  },
  {
    slug: "marketing-agencies",
    title: "AI Social Media Tool for Marketing Agencies",
    metaTitle:
      "AI Social Media Post Generator for Marketing Agencies | oDesigns",
    metaDescription:
      "Scale your agency's social media output with AI. Generate on-brand posts for multiple clients, manage separate brand kits, and publish across platforms.",
    keywords: [
      "marketing agency social media tool",
      "agency social media management",
      "multi-client social media",
      "AI content generation agency",
      "white label social media tool",
    ],
    heroTitle: "Scale your client output without scaling your team",
    heroSubtitle:
      "More clients should not mean more designers. Generate on-brand social media content for every client from one platform — with separate brand kits, workspaces, and publishing channels.",
    painPoints: [
      {
        title: "Separate workspaces per client",
        description:
          "Each client gets their own workspace with unique brand colors, fonts, logos, and connected social accounts. Switch between clients in one click — no cross-contamination.",
      },
      {
        title: "10x content output",
        description:
          "What used to take a designer 30 minutes per post now takes seconds. Generate multiple variations, pick the best, and move on. Your team handles strategy while AI handles production.",
      },
      {
        title: "Consistent quality at scale",
        description:
          "Every generated post respects the client's brand guidelines automatically. No more junior designer mistakes. No more off-brand colors or wrong fonts.",
      },
    ],
    features: [
      {
        title: "Multi-workspace management",
        description:
          "Create separate workspaces for each client with independent brand kits, post libraries, and publishing schedules.",
        icon: "Building2",
      },
      {
        title: "AI-powered generation",
        description:
          "Generate dozens of on-brand posts per client in minutes. Multiple AI engines for different creative styles.",
        icon: "Sparkles",
      },
      {
        title: "Cross-platform publishing",
        description:
          "Connect each client's social accounts and publish from their workspace. Instagram, Facebook, Threads, Twitter — all managed centrally.",
        icon: "Share2",
      },
      {
        title: "Brand kit per client",
        description:
          "Store each client's colors, fonts, and logos. AI uses these automatically — ensuring every post is on-brand.",
        icon: "Palette",
      },
    ],
    cta: {
      title: "Scale your agency with AI",
      subtitle:
        "Join agencies using oDesigns to manage multi-client social media at scale. Free to start.",
    },
    locales: {
      ar: {
        title: "أداة سوشيال ميديا بالذكاء الاصطناعي لوكالات التسويق",
        metaTitle: "مولّد منشورات سوشيال ميديا بالذكاء الاصطناعي لوكالات التسويق | oDesigns",
        metaDescription: "وسّع إنتاج سوشيال ميديا وكالتك بالذكاء الاصطناعي. أنشئ منشورات متوافقة مع الهوية لعدة عملاء وأدِر هويات بصرية منفصلة.",
        heroTitle: "وسّع إنتاج عملائك بدون توسيع فريقك",
        heroSubtitle: "المزيد من العملاء لا يعني المزيد من المصممين. أنشئ محتوى سوشيال ميديا متوافق مع الهوية لكل عميل من منصة واحدة.",
        painPoints: [
          { title: "مساحات عمل منفصلة لكل عميل", description: "كل عميل يحصل على مساحة عمل خاصة بألوان وخطوط وشعارات وحسابات اجتماعية فريدة. انتقل بين العملاء بنقرة واحدة." },
          { title: "١٠ أضعاف حجم الإنتاج", description: "ما كان يستغرق ٣٠ دقيقة لكل منشور أصبح يستغرق ثوانٍ. أنشئ تنويعات متعددة واختر الأفضل. فريقك يتولى الاستراتيجية والذكاء الاصطناعي يتولى الإنتاج." },
          { title: "جودة متسقة على نطاق واسع", description: "كل منشور مولّد يحترم إرشادات العلامة التجارية للعميل تلقائياً. لا مزيد من أخطاء المصممين المبتدئين." },
        ],
        features: [
          { title: "إدارة مساحات عمل متعددة", description: "أنشئ مساحات عمل منفصلة لكل عميل بهويات بصرية ومكتبات منشورات وجداول نشر مستقلة." },
          { title: "التوليد بالذكاء الاصطناعي", description: "أنشئ عشرات المنشورات المتوافقة مع الهوية لكل عميل في دقائق. محركات ذكاء اصطناعي متعددة لأساليب إبداعية مختلفة." },
          { title: "النشر عبر المنصات", description: "اربط حسابات كل عميل وانشر من مساحة عمله. إنستغرام وفيسبوك وثريدز وتويتر — كلها تُدار مركزياً." },
          { title: "هوية بصرية لكل عميل", description: "خزّن ألوان وخطوط وشعارات كل عميل. الذكاء الاصطناعي يستخدمها تلقائياً." },
        ],
        cta: { title: "وسّع وكالتك بالذكاء الاصطناعي", subtitle: "انضم للوكالات التي تستخدم oDesigns لإدارة سوشيال ميديا متعددة العملاء. مجاني للبدء." },
      },
    },
  },
];

export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return useCases.find((uc) => uc.slug === slug);
}

/** Get a use case with locale-specific content (falls back to English) */
export function getLocalizedUseCase(slug: string, locale: string): (UseCase & UseCaseContent) | undefined {
  const uc = getUseCaseBySlug(slug);
  if (!uc) return undefined;
  if (locale === "en") return uc;
  // Check inline locales first, then external locales file
  const localized = uc.locales?.[locale];
  if (!localized) return uc;
  return {
    ...uc,
    ...localized,
    // Merge features: keep icons from English, take titles/descriptions from locale
    features: uc.features.map((f, i) => ({
      ...f,
      ...(localized.features?.[i] || {}),
    })),
  };
}
