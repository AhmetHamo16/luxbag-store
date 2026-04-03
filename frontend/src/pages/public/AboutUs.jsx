import React from 'react';
import { Link } from 'react-router-dom';
import useLangStore from '../../store/useLangStore';

const AboutUs = () => {
  const language = useLangStore(state => state.language);
  const t = {
    en: {
      storyTitle: "Our Story",
      storyText: "Melora was born from a passion for timeless elegance and uncompromising quality. We believe that a luxury handbag is not just an accessory, but a statement of identity, crafted to accompany you through life's most meaningful moments.",
      valuesTitle: "Our Values",
      qTitle: "Uncompromising Quality",
      qText: "We source only the finest materials, ensuring every Melora piece stands the test of time.",
      dTitle: "Timeless Design",
      dText: "Our designs transcend seasonal trends, offering classic elegance that never goes out of style.",
      sTitle: "Sustainable Luxury",
      sText: "We are committed to ethical craftsmanship and sustainable practices in every step of our process.",
      craftTitle: "Master Craftsmanship",
      craftText: "Every Melora handbag is meticulously crafted by master artisans who have dedicated their lives to the art of leatherworking. From the initial sketch to the final stitch, each piece undergoes rigorous quality control to ensure perfection.",
      explore: "Explore the Collection"
    },
    ar: {
      storyTitle: "قصتنا",
      storyText: "ولدت ميلورا من شغف بالأناقة الخالدة والجودة التي لا تساوم. نحن نؤمن بأن حقيبة اليد الفاخرة ليست مجرد إكسسوار، بل هي تعبير عن الهوية، صُممت لمرافقتك في أهم لحظات حياتك.",
      valuesTitle: "قيمنا",
      qTitle: "جودة لا تساوم",
      qText: "نحن نستورد فقط أجود المواد، مما يضمن أن كل قطعة من ميلورا تصمد أمام اختبار الزمن.",
      dTitle: "تصميم خالد",
      dText: "تصاميمنا تتجاوز صيحات المواسم، لتقدم أناقة كلاسيكية لا تفقد بريقها أبداً.",
      sTitle: "فخامة مستدامة",
      sText: "نحن ملتزمون بالحرفية الأخلاقية والممارسات المستدامة في كل خطوة من عمليتنا.",
      craftTitle: "إتقان الحرفية",
      craftText: "كل حقيبة من ميلورا مصنوعة بدقة وعناية من قبل حرفيين مهرة كرسوا حياتهم لفن صناعة الجلود. من الرسم الأولي إلى الغرزة الأخيرة، تخضع كل قطعة لرقابة صارمة لضمان الكمال.",
      explore: "اكتشفي التشكيلة"
    },
    tr: {
      storyTitle: "Hikayemiz",
      storyText: "Melora, zamansız zarafet ve tavizsiz kalite tutkusundan doğdu. Lüks bir el çantasının sadece bir aksesuar değil, hayatınızın en anlamlı anlarında size eşlik etmek üzere tasarlanmış bir kimlik ifadesi olduğuna inanıyoruz.",
      valuesTitle: "Değerlerimiz",
      qTitle: "Tavizsiz Kalite",
      qText: "Sadece en iyi malzemeleri tedarik ediyor, her Melora parçasının zamana meydan okumasını sağlıyoruz.",
      dTitle: "Zamansız Tasarım",
      dText: "Tasarımlarımız sezonluk trendleri aşarak asla modası geçmeyen klasik bir zarafet sunuyor.",
      sTitle: "Sürdürülebilir Lüks",
      sText: "Sürecimizin her adımında etik işçiliğe ve sürdürülebilir uygulamalara bağlıyız.",
      craftTitle: "Usta İşçilik",
      craftText: "Her Melora el çantası, hayatlarını deri işleme sanatına adamış usta zanaatkarlar tarafından titizlikle üretilmektedir. İlk eskizden son dikişe kadar her parça mükemmelliği sağlamak için titiz bir kalite kontrolünden geçer.",
      explore: "Koleksiyonu Keşfet"
    }
  }[language] || t.en;
  return (
    <div className="bg-white">
      {/* Brand Story Hero */}
      <section className="relative py-20 bg-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src="/logo.png" alt="Melora Logo" loading="lazy" className="h-24 w-auto mx-auto mb-8 object-contain" />
          <h1 className="text-4xl md:text-5xl font-serif text-brand mb-6">{t.storyTitle}</h1>
          <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed">
            {t.storyText}
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-brand mb-4">{t.valuesTitle}</h2>
            <div className="w-12 h-[2px] bg-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-xl font-serif text-brand mb-4">{t.qTitle}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t.qText}</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-serif text-brand mb-4">{t.dTitle}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t.dText}</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
              </div>
              <h3 className="text-xl font-serif text-brand mb-4">{t.sTitle}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t.sText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <img loading="lazy" src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop" alt="Craftsmanship" className="w-full h-auto rounded-sm shadow-xl" />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-serif text-brand mb-6">{t.craftTitle}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t.craftText}
              </p>
              <Link to="/shop" className="inline-block bg-brand text-beige px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-gold transition-colors">
                {t.explore}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
