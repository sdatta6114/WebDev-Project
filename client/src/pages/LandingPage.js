// File: client/src/pages/LandingPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

// --- Data for easy updates ---
const features = [
    {
        icon: '📊',
        title: 'Instant Dashboards',
        description: 'Connect your Excel or Google Sheets file and watch as our AI instantly generates insightful, interactive dashboards.'
    },
    {
        icon: '🔗',
        title: 'Seamless Collaboration',
        description: 'Share dashboards with your team. Control access with user, admin, and superadmin roles to ensure data security.'
    },
    {
        icon: '🔒',
        title: 'Bank-Grade Security',
        description: 'Your data is encrypted end-to-end. We use industry-leading security protocols to keep your information safe.'
    }
];

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: '/ month',
        description: 'For individuals and small teams getting started.',
        features: ['5 Users', '10 Dashboards', 'Basic Support'],
        isFeatured: false,
        buttonText: 'Get Started',
        linkTo: '/register'
    },
    {
        name: 'Pro',
        price: '$49',
        period: '/ month',
        description: 'For growing businesses that need more power.',
        features: ['25 Users', 'Unlimited Dashboards', 'Admin Controls', 'Priority Support'],
        isFeatured: true,
        buttonText: 'Choose Plan'
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For large organizations with custom needs.',
        features: ['Unlimited Users', 'Superadmin Role', 'Dedicated Support', 'Custom Integrations'],
        isFeatured: false,
        buttonText: 'Contact Us'
    }
];

const faqs = [
    {
        question: 'What file types are supported?',
        answer: 'We currently support .xlsx, .xls, and .csv files. We are actively working on adding support for Google Sheets and other data sources.'
    },
    {
        question: 'Is my data secure?',
        answer: 'Absolutely. Security is our top priority. All data is encrypted both in transit and at rest using AES-256 encryption. We never view or share your data.'
    },
    {
        question: 'Can I cancel my subscription at any time?',
        answer: 'Yes, you can cancel your Pro plan at any time from your account settings. You will retain access to Pro features until the end of your billing cycle.'
    }
];

// Words for the animated text effect
const animatedWords = ['Insights', 'Growth', 'Clarity'];

const LandingPage = () => {
    const [openAccordion, setOpenAccordion] = useState(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    // Effect to cycle through the animated words
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % animatedWords.length);
        }, 2500); // Change word every 2.5 seconds
        return () => clearInterval(interval);
    }, []);


    const toggleAccordion = (index) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    return (
        <div className={styles.page}>
            {/* --- Header --- */}
            <header className={styles.header}>
                <h1 className={styles.logo}>AnalytixExcel</h1>
                <nav className={styles.mainNav}>
                    <a href="#features">Capabilities</a>
                    <a href="#plans">Plans</a>
                    <a href="#support">Support</a>
                </nav>
                <div className={styles.authButtons}>
                    <Link to="/login" className={styles.loginLink}>Login</Link>
                    <Link to="/register" className={styles.registerButton}>Get Started</Link>
                </div>
            </header>

            {/* --- Hero Section --- */}
            <main className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        From Sheets to Smart{' '}
                        <span className={styles.animatedTextContainer}>
                            {animatedWords.map((word, index) => (
                                <span
                                    key={word}
                                    className={`${styles.animatedWord} ${index === currentWordIndex ? styles.visible : ''}`}
                                >
                                    {word}
                                </span>
                            ))}
                        </span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Upload Excel, map your data, and visualize trends instantly—built for teams that move fast and need clarity. No fluff, just insight.
                    </p>
                    <div className={styles.heroButtons}>
                        <Link to="/register" className={styles.ctaButton}>Get Started</Link>
                        <Link to="/login" className={styles.secondaryButton}>Login</Link>
                    </div>
                </div>
                <div className={styles.heroImageContainer}>
                    <img src="/images/hero.png" alt="Data chart illustration" className={styles.heroImage} />
                </div>
            </main>

            {/* --- Features Section --- */}
            <section id="features" className={styles.featuresSection}>
                <h2 className={styles.sectionTitle}>Everything you need, nothing you don't.</h2>
                <p className={styles.sectionSubtitle}>Powerful features to turn your raw data into a competitive advantage.</p>
                <div className={styles.featuresGrid}>
                    {features.map(feature => (
                        <div key={feature.title} className={styles.featureCard}>
                            <div className={styles.featureIcon}>{feature.icon}</div>
                            <h3 className={styles.featureTitle}>{feature.title}</h3>
                            <p className={styles.featureDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* --- Plans Section --- */}
            <section id="plans" className={styles.plansSection}>
                <h2 className={styles.sectionTitle}>Choose the plan that's right for you.</h2>
                <p className={styles.sectionSubtitle}>Simple, transparent pricing for teams of all sizes.</p>
                <div className={styles.plansGrid}>
                    {plans.map(plan => (
                        <div key={plan.name} className={`${styles.planCard} ${plan.isFeatured ? styles.featured : ''}`}>
                            {plan.isFeatured && <div className={styles.featuredBadge}>Most Popular</div>}
                            <h3 className={styles.planName}>{plan.name}</h3>
                            <p className={styles.planDescription}>{plan.description}</p>
                            <div className={styles.planPrice}>
                                {plan.price}
                                {plan.period && <span className={styles.planPeriod}>{plan.period}</span>}
                            </div>
                            <ul className={styles.planFeatures}>
                                {plan.features.map(feature => <li key={feature}>{feature}</li>)}
                            </ul>
                            {plan.linkTo ? (
                                <Link to={plan.linkTo} className={styles.planButton}>{plan.buttonText}</Link>
                            ) : (
                                <button className={styles.planButton}>{plan.buttonText}</button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* --- How It Works Section --- */}
            <section id="how-it-works" className={styles.howItWorksSection}>
                <div className={styles.howItWorksContent}>
                    <h2 className={styles.sectionTitle}>Get started in 3 simple steps.</h2>
                    <p className={styles.sectionSubtitle}>Analyzing your data has never been this easy.</p>
                    <ul className={styles.stepsList}>
                        <li><span>1</span> <strong>Upload Your File:</strong> Securely drag and drop your Excel or CSV file.</li>
                        <li><span>2</span> <strong>Map Your Data:</strong> Our smart tool helps you identify key metrics and columns.</li>
                        <li><span>3</span> <strong>Visualize & Share:</strong> Instantly see your dashboard and share it with your team.</li>
                    </ul>
                </div>
                <div className={styles.howItWorksImageContainer}>
                    <img src="/images/illustration.png" alt="Illustration of a user interface for data analytics" className={styles.howItWorksImage} />
                </div>
            </section>

            {/* --- Support Section --- */}
            <section id="support" className={styles.supportSection}>
                <h2 className={styles.sectionTitle}>We're here to help.</h2>
                <p className={styles.sectionSubtitle}>Have questions? Find answers in our FAQ or get in touch with our support team.</p>
                <div className={styles.supportGrid}>
                    <div className={styles.supportFormContainer}>
                        <h3 className={styles.supportSubTitle}>Send us a message</h3>
                        <form className={styles.supportForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="message">Message</label>
                                <textarea id="message" name="message" rows="5" required></textarea>
                            </div>
                            <button type="submit" className={styles.submitButton}>Send Message</button>
                        </form>
                    </div>
                    <div className={styles.faqContainer}>
                        <h3 className={styles.supportSubTitle}>Frequently Asked Questions</h3>
                        <div className={styles.accordion}>
                            {faqs.map((faq, index) => (
                                <div key={index} className={styles.accordionItem}>
                                    <button onClick={() => toggleAccordion(index)} className={styles.accordionQuestion}>
                                        {faq.question}
                                        <span className={openAccordion === index ? styles.rotated : ''}>▼</span>
                                    </button>
                                    <div className={`${styles.accordionAnswer} ${openAccordion === index ? styles.open : ''}`}>
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

             {/* --- Testimonials Section --- */}
            <section id="testimonials" className={styles.testimonialsSection}>
                 <h2 className={styles.sectionTitle}>Trusted by data-driven teams.</h2>
                 <div className={styles.testimonialsGrid}>
                    <div className={styles.testimonialCard}>
                        <p className={styles.testimonialText}>"This tool transformed our weekly reporting. What took hours now takes minutes. A complete game-changer for our team."</p>
                        <div className={styles.testimonialAuthor}>
                            <p><strong>Sarah L.</strong><br/>Marketing Manager</p>
                        </div>
                    </div>
                     <div className={styles.testimonialCard}>
                        <p className={styles.testimonialText}>"The simplicity is its greatest strength. We went from messy spreadsheets to clear, actionable insights overnight."</p>
                        <div className={styles.testimonialAuthor}>
                            <p><strong>Mark C.</strong><br/>Operations Lead</p>
                        </div>
                    </div>
                 </div>
            </section>

            {/* --- Footer --- */}
            <footer className={styles.footer}>
                <p>&copy; 2025 AnalytixExcel. All Rights Reserved.</p>
                <div className={styles.footerLinks}>
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms">Terms of Service</a>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
