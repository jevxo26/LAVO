import BlogSection from "@/components/blog/BlogSection";
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import { PageHero } from "@/components/shared/PageHero"

const heroData = {
    subtitle: "Blog",
    title: "Insights & Resources",
    content:
        "Expert advice, industry news, and behind-the-scenes stories from the LAUNDRIX team.",
};

const InsightsResourcesPage = () => {
    return (
        <div>
            <Navbar />
            <div className="flex-1">
                <PageHero data={heroData} />
                <BlogSection />
            </div>
            <Footer />
        </div>
    )
}

export default InsightsResourcesPage
