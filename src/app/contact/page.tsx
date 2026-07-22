import ContactSection from "@/components/contact/ContactSection";
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import { PageHero } from "@/components/shared/PageHero"

const heroData = {
    subtitle: "Contact",
    title: "Get in Touch",
    content:
        "We respond to all inquiries within 2 business hours.",
};

const GetInTouchPage = () => {
    return (
        <div>
            <Navbar />
            <div className="flex-1">
                <PageHero data={heroData} />
                <ContactSection />
            </div>
            <Footer />
        </div>
    )
}

export default GetInTouchPage
