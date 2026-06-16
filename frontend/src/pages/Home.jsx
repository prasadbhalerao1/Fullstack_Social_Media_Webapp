import Sidebar from "@/components/layout/Sidebar.jsx";
import Stories from "@/components/stories/Stories.jsx";
import Feed from "@/components/posts/Feed.jsx";
import Suggestions from "@/components/common/Suggestions.jsx";

const Home = () => {
  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 flex justify-center py-6 px-4 md:px-8 overflow-auto">
        <div className="w-full max-w-[850px] flex gap-12">
          {/* Main Feed Column */}
          <div className="flex-1 max-w-[470px] flex flex-col gap-6">
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
