import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import tasksImage from '../components/images/tasks.jpg';
import Footer from '../components/Footer'
const Home = () => {
    const [email, setEmail] = useState(""); // State for the email input
    const [error, setError] = useState(""); // State for error messages
    const navigate = useNavigate(); // For navigation to the sign-up page

    const handleSignup = () => {
        if (email.includes("@gmail.com")) {
            navigate("/signup", { state: { email } }); // Navigate to sign-up page with email
        } else {
            setError("Please enter a valid Gmail address."); // Show error for invalid email
        }
    };
    return (
        <div>
            <Navbar />

            <div className="md:w-screen md:h-[70%] p-10 ">
                <div className="md:h-full md:w-full flex flex-col  md:flex-row  justify-center items-center bg-gradient-to-r from-indigo-700 to-red-400 md:rounded-ss-[100px] md:rounded-br-[100px] rounded-3xl">
                    {/* Left Section */}
                    <div className="md:h-[75%] md:px-8 flex flex-col justify-center items-center md:w-[40%] pb-16">
                        <h2 className="md:text-[40px] text-[25px] text-white tracking-tight md:pb-8 pb-5 text-center">
                            Unite your team, stay connected, and get things done—faster and better.
                        </h2>
                        <h3 className="md:text-xl text-lg text-white tracking-widest text-center pb-8">
                            Keep everything in the same place—even if your team isn’t.
                        </h3>
                        <div className="w-full px-5 gap-2 flex flex-col md:flex-row justify-center items-center">
                            <input
                                className="md:w-[65%] w-full py-3 px-3 rounded-lg mb-4 md:mb-0"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(""); // Clear error when user types
                                }}
                            />
                            <button
                                className="px-10 py-3 bg-blue-500 rounded-lg text-white"
                                onClick={handleSignup}
                            >
                                Sign Up
                            </button>
                        </div>
                        {error && <p className="text-red-500 mt-2">{error}</p>} {/* Show error */}
                    </div>

                    {/* Right Section */}
                    <div className="md:w-[40%] md:h-full">
                        <img
                            className="w-full md:h-full md:py-10"
                            src="https://images.ctfassets.net/rz1oowkt5gyp/75rDABL8fyMtNLlUAtBxrg/c5e145977a86c41c47e17c69410c64f7/TrelloUICollage_4x.png?w=1140&fm=webp"
                            alt="Teamwork Illustration"
                        />
                    </div>
                </div>

            </div>




            <div className=" px-2 md:py-10 md:px-52 bg-gray-100 flex flex-col " >
                <div className="md:pb-10 pb-3 p-5">
                    <h2 className="text-3xl pb-5 font-semibold ">A productivity powerhouse</h2>
                    <p className="text-lg text-gray-800 leading-10">Simple, flexible, and powerful. All it takes are boards, lists, and<br></br> cards to get a clear view of who’s doing what and what needs to<br></br> get done.</p>
                </div>
                <div className="flex flex-col items-center md:flex-row w-screen">
                    <div className="flex flex-col md:gap-3 md:w-[30%] p-3">
                        <div className="md:w-[75%] leading-6 bg-white rounded-lg md:p-5">
                            <h3 className="text-xl font-semibold pb-2 ">Boards</h3>
                            <p className="text-gray-800">Trello boards keep tasks organized and work moving forward. In a glance, see everything from “things to do” to “aww yeah, we did it!”</p>
                        </div>
                        <div className="md:w-[75%] leading-6   rounded-lg md:p-4">
                            <h3 className="text-xl font-normal pb-2 ">Lists</h3>
                            <p className="text-gray-800 text-[16px]">The different stages of a task. Start as simple as To Do, Doing or Done—or build a workflow custom fit to your team’s needs. There’s no wrong way to Trello.</p>
                        </div>
                        <div className="w-[75%] leading-6  rounded-lg p-5">
                            <h3 className="text-xl font-normal pb-2 ">Cards</h3>
                            <p className="text-gray-800 text-[16px]">Cards represent tasks and ideas and hold all the information to get the job done. As you make progress, move cards across lists to show their status.</p>
                        </div>
                    </div>
                    <div className='w-[50%]'>
                        <img src={tasksImage}></img>
                    </div>

                </div>
            </div>

            <Footer />

        </div>
    )
}

export default Home