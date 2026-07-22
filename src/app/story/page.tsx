import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import { PageHero } from "@/components/shared/PageHero";
import Journey from "@/components/story/Journey";
import LeadershipTeam from "@/components/story/LeadershipTeam";
import Mission from "@/components/story/Mission";

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
