import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { PageHero } from "@/components/shared/PageHero";
import Journey from "@/components/marketing/story/Journey";
import LeadershipTeam from "@/components/marketing/story/LeadershipTeam";
import Mission from "@/components/marketing/story/Mission";

const heroData = {
    subtitle: "About Us",
    title: "The LAUNDRIX Story",
    content:
        "From a signle Manhattan location to a city-wise platform serving thousands dailys.",
};

const StoryPage = () => {
    return (
        <div>
            <Navbar />
            <div className="flex-1">
                <PageHero data={heroData} />

                {/* Story Sections */}
                <Mission />
                <Journey />
                <LeadershipTeam />
            </div>
            <Footer />
        </div>
    )
}

export default StoryPage
