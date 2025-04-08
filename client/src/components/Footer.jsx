import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <div>
            <footer className="relative bg-black pt-8 pb-6 text-white ">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap text-left lg:text-left">
                        <div className="w-full lg:w-6/12 px-4">
                            <h4 className="text-3xl fonat-semibold text-blueGray-700">Let's keep in touch!</h4>
                            <h5 className="text-lg mt-0 mb-2 text-blueGray-600">
                                Find us on any of these platforms, we respond 1-2 business days.
                            </h5>
                            <div className="mt-6 lg:mb-0 mb-6">
                                <button className="bg-blue-500 text-lightBlue-400 shadow-lg font-normal h-8 w-8 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2" type="button">
                                    <i className="fab fa-twitter"></i></button><button className="bg-blue-500 text-lightBlue-600 shadow-lg font-normal h-8 w-8 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2" type="button">
                                    <i className="fab fa-facebook-square"></i></button><button className="bg-blue-500 text-white shadow-lg font-normal h-8 w-8 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2" type="button">
                                    <i className="fab fa-dribbble"></i></button><button className="bg-blue-500 text-blueGray-800 shadow-lg font-normal h-8 w-8 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2" type="button">
                                    <i className="fab fa-github"></i>
                                </button>
                            </div>
                        </div>
                        <div className="w-full lg:w-6/12 px-4">
                            <div className="flex flex-wrap items-top mb-6">
                                <div className="w-full lg:w-4/12 px-4 ml-auto">
                                    <span className="block uppercase text-blueGray-500 text-sm font-semibold mb-2 text-blue-500">Useful Links</span>
                                    <ul className="list-unstyled">
                                        <li>
                                            <Link className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm" to="https://www.creative-tim.com/presentation?ref=njs-profile">About Us</Link>
                                        </li>
                                        <li>
                                            <Link className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm" to="https://blog.creative-tim.com?ref=njs-profile">Blog</Link>
                                        </li>
                                        <li>
                                            <Link className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm" to="https://www.github.com/creativetimofficial?ref=njs-profile">Github</Link>
                                        </li>
                                        <li>
                                            <Link className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm" to="https://www.creative-tim.com/bootstrap-themes/free?ref=njs-profile">Free Products</Link>
                                        </li>
                                    </ul>
                                </div>
                                <div className="w-full lg:w-4/12 px-4">
                                    <span className="block uppercase text-blueGray-500 text-sm font-semibold mb-2 text-blue-500">Other Resources</span>
                                    <ul className="list-unstyled">
                                        <li>
                                            <Link className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm" to="https://github.com/creativetimofficial/notus-js/blob/main/LICENSE.md?ref=njs-profile">MIT License</Link>
                                        </li>
                                        <li>
                                            <Link className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm" to="https://creative-tim.com/terms?ref=njs-profile">Terms &amp; Conditions</Link>
                                        </li>
                                        <li>
                                            <Link className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm" to="https://creative-tim.com/privacy?ref=njs-profile">Privacy Policy</Link>
                                        </li>
                                        <li>
                                            <Link className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm" to="https://creative-tim.com/contact-us?ref=njs-profile">Contact Us</Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="my-6 border-blueGray-300" />
                    <div className="flex flex-wrap items-center md:justify-between justify-center">
                        <div className="w-full md:w-4/12 px-4 mx-auto text-center">
                            <div className="text-sm text-blueGray-500 font-semibold py-1">
                                Copyright © <span className='text-blue-500' id="get-current-year ">2021</span><Link to="https://www.creative-tim.com/product/notus-js" className="text-blueGray-500 hover:text-gray-800" target="_blank"> Notus JS by</Link>
                                <Link to="https://www.creative-tim.com?ref=njs-profile" className="text-blueGray-500 hover:text-blueGray-800">Creative Tim</Link>.
                            </div>
                        </div>
                    </div>
                </div>
            </footer>



        </div>
    )
}

export default Footer
