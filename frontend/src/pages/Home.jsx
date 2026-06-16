import Sidebar from "@/components/layout/Sidebar.jsx";
import Stories from "@/components/stories/Stories.jsx";

const Home = () => {
  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 w-full p-4 mx-auto flex flex-col gap-6 overflow-auto">
        <Stories />
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-gray-400">Hello main content</p>
      </main>
    </div>
  );
};

export default Home;
