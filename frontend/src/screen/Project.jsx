import React, { useRef, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import LocomotiveScroll from "locomotive-scroll";
import { CurrentProjectContext } from "../context/project.context";
import { useUser } from "../context/user.context";
import axiosInstance from "../config/axios";
import Markdown from "markdown-to-jsx";
import { getWebcontainer } from "../config/webContainer";
import {
  InitializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";

const Project = () => {
  const scrollRef = useRef(null);
  const messageAreaRef = useRef(null);

  // project state
  const location = useLocation();
  const { project } = location.state;
  // current Project
  const [currentProject, setCurrentProject] = useState([]);
  // Message state
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]); // State to store all messages
  // file tree state
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(-1);
  // Logged in user
  const { user } = useUser();
  // WebContainer instance
  const [webContainer, setWebContainer] = useState(null);

  // website frame
  const [iframeURL, setIframeURL] = useState(null);
  const [toggleIframe, setToggleIframe] = useState(false);

  // Process state
  const [runProcess, setRunProcess] = useState(null);

  // loading
  const [runLoading, setRunLoading] = useState(false);

  const fetchCurrentProject = async (projectId) => {
    try {
      const res = await axiosInstance.get(`/project/getProject/${projectId}`);
      setCurrentProject(res.data);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return; // Prevent sending empty messages
    const data = {
      message,
      user: user._id,
      projectId: project._id,
    };
    sendMessage("project-message", data);
    const formattedData = {
      ...data,
      user: {
        _id: user._id,
        email: user.email,
      },
    };
    appendMessage(formattedData);
    setMessage(""); // Clear the input after sending
  };

  useEffect(() => {
    if (webContainer === null) {
      getWebcontainer().then((instance) => {
        setWebContainer(instance);
      });
    }
    fetchCurrentProject(project._id);
    InitializeSocket(project._id);

    receiveMessage("project-message", (data) => {
      // Handle incoming message
      appendMessage(data);
    });

    const scroll = new LocomotiveScroll({
      el: scrollRef.current,
      smooth: true,
      lerp: 0.07,
      getDirection: true,
    });

    // Scroll to top on route change
    scroll.scrollTo(0, { duration: 0, disableLerp: true });
    return () => scroll.destroy();
  }, []);

  const appendMessage = async (data) => {
    setAllMessages((prevMessages) => [...prevMessages, data]);

    const jsonData = extractJsonFromMarkdown(data.message);
    if (jsonData && jsonData.fileTree) {
      console.log(jsonData);
      console.log(jsonData.fileTree);
      setFileTree(jsonData.fileTree);
      setCurrentFile([]);
      setCurrentFileIndex(-1);
      await webContainer?.mount(jsonData.fileTree);
    }

    // Scroll to the bottom after the new message is added
    requestAnimationFrame(() => {
      if (messageAreaRef.current) {
        messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
      }
    });
  };

  const extractJsonFromMarkdown = (md) => {
    try {
      let jsonContent;
      if (md.startsWith("```json") && md.endsWith("```")) {
        jsonContent = md.slice(7, -3).trim(); // Remove ```json from start and ``` from end
      } else {
        jsonContent = md;
      }
      // jsonContent = jsonContent.replace(/\\/g, ""); // Remove all backslashes
      // console.log(jsonContent);
      return JSON.parse(jsonContent);
    } catch (e) {
      // console.error("Invalid JSON in markdown:", e.message);
      return null;
    }
  };

  return (
    <>
      {currentProject.length !== 0 && (
        <div data-scroll-container ref={scrollRef}>
          <CurrentProjectContext.Provider
            value={{ currentProject, fetchCurrentProject }}
          >
            <Navbar type={"detail"} />
          </CurrentProjectContext.Provider>
          <main className="h-[93vh] w-screen flex">
            {/* Chat Section */}
            <section
              id="chat-area"
              className="w-[25%] h-full bg-neutral-800 p-2"
            >
              <div
                id="chat-area-wrapper"
                className="h-full flex flex-col overflow-hidden"
              >
                <div
                  data-scroll-section
                  id="message-area"
                  ref={messageAreaRef}
                  className="h-full overflow-y-auto bg-neutral-700 rounded-sm p-3 mb-2 scroll-smooth hide-scrollbar"
                >
                  <div
                    data-scroll-ignore
                    id="message-container"
                    className="flex flex-col gap-4 h-fit"
                  >
                    {allMessages.map((msg, index) => {
                      const jsonData = extractJsonFromMarkdown(msg.message);
                      const messageContent = jsonData
                        ? jsonData.text
                        : msg.message;

                      return (
                        <div
                          key={index}
                          className={
                            msg.user._id === user._id
                              ? "flex flex-col items-end self-end max-w-[85%]"
                              : "flex flex-col items-start max-w-[85%]"
                          }
                        >
                          <span className="text-xs text-gray-400 mb-1">
                            {msg.user._id === user._id ? "" : msg.user.email}
                          </span>
                          <div
                            className={`${
                              msg.user._id === user._id
                                ? "bg-blue-600"
                                : "bg-neutral-600"
                            } rounded-b-lg ${
                              msg.user._id === user._id
                                ? "rounded-tl-lg"
                                : "rounded-tr-lg"
                            } p-3 text-white`}
                          >
                            <Markdown>{messageContent}</Markdown>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Input Area */}
                <div id="input-area" className="h-14 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow px-4 py-2 bg-neutral-800 rounded-sm focus:outline-none text-white"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-6 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </section>

            {/* Right Section */}
            <section className="w-[75%] h-full bg-neutral-700 flex">
              {/* You can add content here */}
              <section
                id="file-tree"
                className="w-[20%] h-full bg-neutral-800 flex-shrink-0 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-1 pr-2">
                  <h2 className="text-white text-md uppercase p-3">Explorer</h2>
                  <button
                    className={`p-1 px-2 rounded-sm border ${
                      runLoading ? "bg-neutral-200" : "bg-neutral-50"
                    } cursor-pointer flex`}
                    onClick={async () => {
                      if (runLoading) return;
                      if (!webContainer) return;
                      if (Object.keys(fileTree).length === 0) return;
                      setRunLoading(true);

                      // Mount the file system
                      await webContainer.mount(fileTree);

                      // Run `npm install`
                      const installProcess = await webContainer.spawn("npm", [
                        "install",
                      ]);

                      // Optional: log install output
                      installProcess.output.pipeTo(
                        new WritableStream({
                          write(data) {
                            console.log("[install]", data);
                          },
                        })
                      );

                      // Wait for install to finish
                      const installExitCode = await installProcess.exit;
                      if (installExitCode !== 0) {
                        console.error("Install failed");
                        return;
                      }

                      if (runProcess !== null) {
                        // Kill the previous process if it exists
                        await runProcess.kill();
                      }

                      // Run `npm start`
                      const tempRunProcess = await webContainer.spawn("npm", [
                        "start",
                      ]);

                      setRunProcess(tempRunProcess);
                      // Pipe the output
                      tempRunProcess.output.pipeTo(
                        new WritableStream({
                          write(data) {
                            console.log("[start]", data);
                          },
                        })
                      );

                      webContainer.on("server-ready", (port, url) => {
                        setIframeURL(url);
                        console.log("Server is ready at:", url, port);
                        setToggleIframe(true);
                      });

                      // setTimeout(() => {
                      // }, 3000);
                      setRunLoading(false);
                    }}
                  >
                    {runLoading ? (
                      <i className="ri-loader-4-line animate-spin text-[1rem]"></i>
                    ) : (
                      <p>Run</p>
                    )}
                  </button>
                </div>
                <ul className="text-gray-300 text-xs">
                  {Object.keys(fileTree).map((filename) => (
                    <li
                      key={filename}
                      onClick={() => {
                        if (!currentFile.includes(filename)) {
                          setCurrentFile((ele) => [...ele, filename]);
                          setCurrentFileIndex(currentFile.length);
                        } else {
                          setCurrentFileIndex(currentFile.indexOf(filename));
                        }
                      }}
                      className={`truncate p-2 px-3 hover:bg-neutral-700 ${
                        filename === currentFile[currentFileIndex]
                          ? "bg-neutral-700"
                          : ""
                      } cursor-pointer transition-colors duration-200`}
                    >
                      {filename}
                    </li>
                  ))}
                </ul>
              </section>
              {currentFile && (
                <section
                  id="file-content"
                  className="w-[80%] h-full bg-neutral-600"
                >
                  <div
                    id="files-top"
                    className=" flex overflow-scroll w-full h-[3rem]"
                  >
                    {currentFile.map((file, index) => (
                      <div
                        key={index}
                        className={`text-white text-md p-3 uppercase flex gap-3 w-fit ${
                          index === currentFileIndex
                            ? "border-b-2 border-neutral-100"
                            : "border-transparent"
                        }`}
                      >
                        <p
                          onClick={() => setCurrentFileIndex(index)}
                          className="cursor-pointer"
                        >
                          {file}
                        </p>
                        <i
                          className="ri-close-line cursor-pointer"
                          onClick={() => {
                            setCurrentFileIndex((ele) =>
                              ele === currentFile.length - 1
                                ? currentFile.length - 2
                                : ele
                            );
                            setCurrentFile((ele) =>
                              ele.filter((item) => item !== file)
                            );
                          }}
                        ></i>
                      </div>
                    ))}
                  </div>
                  <div
                    id="file-content-area"
                    className="h-[calc(100%-3rem)] bg-neutral-700 overflow-y-scroll"
                  >
                    <div className="text-gray-300 text-[1rem] p-2 px-3">
                      {JSON.stringify(
                        fileTree[currentFile[currentFileIndex]]?.file.contents
                      )}
                    </div>
                  </div>
                </section>
              )}
            </section>
          </main>
        </div>
      )}
      {toggleIframe && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm">
          <div className="w-[85%] h-[90%] bg-white rounded-sm relative overflow-hidden">
            <button
              className="absolute w-[2rem] h-[2rem] flex items-center justify-center right-[.6rem] top-[.6rem] text-gray-600 hover:text-gray-800 cursor-pointer"
              onClick={() => {
                runProcess.kill();
                setToggleIframe(false);
              }}
            >
              <i className="ri-close-line"></i>
            </button>
            <div className="w-full p-2 flex items-center justify-center border-b border-gray-300">
              <input
                className="p-1 border-b border-gray-300 border rounded-lg"
                type="text"
                name="url"
                id="url"
                value={iframeURL}
                onChange={(ele) => setIframeURL(ele.target.value)}
              />
            </div>
            <iframe src={iframeURL} className="w-full h-full" title="preview" />
          </div>
        </div>
      )}
    </>
  );
};

export default Project;
