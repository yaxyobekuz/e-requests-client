// Icons
import { X } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Router
import { Link } from "react-router-dom";

// React
import { useState, useEffect } from "react";

// Data
import storiesData from "../data/stories.data";

const StoryViewer = ({ story, onClose, onNext, onPrev }) => {
  useEffect(() => {
    // Mark as read immediately on open
    const readStories = JSON.parse(
      localStorage.getItem("read_stories") || "[]",
    );
    if (!readStories.includes(story.id)) {
      localStorage.setItem(
        "read_stories",
        JSON.stringify([...readStories, story.id]),
      );
    }
  }, [story.id]);

  return (
    <div className="fixed inset-0 z-50 bg-black animate__animated animate__fadeIn">
      <div className="h-full sm:container">
        {/* Content Wrapper */}
        <div className="relative size-full overflow-hidden">
          {/* Background Image */}
          <img
            src={story.image}
            alt={story.name}
            className="absolute inset-0 size-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex items-center justify-center absolute top-0 right-0 z-30 size-16 text-white"
          >
            <X className="size-8" />
          </button>

          {/* Navigation tap zones */}
          <div className="absolute inset-0 flex z-10">
            <div className="w-1/2 h-full" onClick={onPrev} />
            <div className="w-1/2 h-full" onClick={onNext} />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-end h-full p-5 pb-10 z-40 text-white xs:pb-5">
            {/* Title */}
            <h2 className="text-xl font-medium drop-shadow-md mb-1.5 xs:text-2xl">
              {story.name}
            </h2>

            {/* Description */}
            {story.description && (
              <p className="opacity-90">{story.description}</p>
            )}

            {/* Action button */}
            {story.button &&
              (story.link ? (
                <Link
                  to={story.link}
                  onClick={onClose}
                  className="z-20 flex items-center justify-center w-full py-3.5 bg-white text-black rounded-xl font-medium mt-6 active:scale-95 transition-transform shadow-lg"
                >
                  {story.button}
                </Link>
              ) : (
                <button className="z-20 flex items-center justify-center w-full py-3.5 bg-white text-black rounded-xl font-medium mt-6 active:scale-95 transition-transform shadow-lg">
                  {story.button}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StoriesPanel = () => {
  const [activeStoryId, setActiveStoryId] = useState(null);
  const [readStories, setReadStories] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("read_stories");
    if (saved) setReadStories(JSON.parse(saved));
  }, [activeStoryId]);

  const handleStoryClick = (id) => {
    setActiveStoryId(id);
  };

  const closeViewer = () => {
    setActiveStoryId(null);
  };

  const activeStory = storiesData.find((s) => s.id === activeStoryId);

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {storiesData.map((story) => {
          const isRead = readStories.includes(story.id);
          return (
            <button
              key={story.id}
              onClick={() => handleStoryClick(story.id)}
              className="flex flex-col items-center gap-2 w-[60px] shrink-0"
            >
              <div
                className={cn(
                  "p-[2px] rounded-full transition-all",
                  isRead
                    ? "bg-gray-200"
                    : "bg-gradient-to-tr from-blue-700 to-cyan-500",
                )}
              >
                <div className="size-14 rounded-full border-2 border-white">
                  <img
                    alt={story.name}
                    src={story.previewImage}
                    className="size-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Titlew */}
              <span className="text-xs truncate w-full text-center font-medium text-gray-700">
                {story.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Story Viewer Overlay */}
      {activeStory && (
        <StoryViewer
          story={activeStory}
          onClose={closeViewer}
          onNext={() => {
            const idx = storiesData.findIndex((s) => s.id === activeStory.id);
            if (idx < storiesData.length - 1)
              setActiveStoryId(storiesData[idx + 1].id);
            else closeViewer();
          }}
          onPrev={() => {
            const idx = storiesData.findIndex((s) => s.id === activeStory.id);
            if (idx > 0) setActiveStoryId(storiesData[idx - 1].id);
          }}
        />
      )}
    </div>
  );
};

export default StoriesPanel;
