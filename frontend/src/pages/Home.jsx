import Sidebar from "@/components/layout/Sidebar.jsx";
import Stories from "@/components/stories/Stories.jsx";
import Feed from "@/components/posts/Feed.jsx";
import Suggestions from "@/components/common/Suggestions.jsx";

const Home = () => {
  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 flex justify-center py-6 px-0 sm:px-4 md:px-8 overflow-y-auto overflow-x-hidden w-full">
        <div className="w-full max-w-5xl flex gap-12">
          {/* Main Feed Column */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 pb-20 md:pb-0">
            <Stories />
            <Feed />
          </div>

          {/* Suggestions Column (Desktop only) */}
          <div className="hidden lg:block w-[320px] shrink-0 pt-4">
            <Suggestions />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
