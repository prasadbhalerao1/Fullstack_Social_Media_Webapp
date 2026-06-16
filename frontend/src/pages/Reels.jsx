import Sidebar from "@/components/layout/Sidebar.jsx";

const Reels = () => {
  return (
    <div className="bg-black/95 flex text-white min-h-screen">
      <Sidebar />
      <main className="flex-1 w-full p-4 mx-auto flex flex-col gap-6 overflow-auto">
        <h1 className="text-2xl font-bold">Reels</h1>
        <p className="text-gray-400">Reels page content</p>
      </main>
    </div>
  );
};

export default Reels;
