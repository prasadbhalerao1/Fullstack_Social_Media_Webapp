import Sidebar from "@/components/layout/Sidebar.jsx";
import Stories from "@/components/stories/Stories.jsx";
import Feed from "@/components/posts/Feed.jsx";

const Home = () => {
  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 w-full p-4 mx-auto flex flex-col gap-6 overflow-auto">
        <Stories />
        <Feed />
      </main>
    </div>
  );
};

export default Home;
