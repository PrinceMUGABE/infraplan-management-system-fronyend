/* eslint-disable no-unused-vars */
import React from 'react';
import AboutImg from '../../assets/pictures/about_lil.jpeg';

function About() {
    return (
        <section id="about" className="py-10 bg-slate-100 dark:bg-slate-900 dark:text-white">
            <h2
                data-aos="fade-up"
                className="text-center text-4xl font-bold mb-10"
            >
                About Us
            </h2>
            <main className="container mx-auto flex flex-col items-center justify-center">

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-4 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div data-aos="fade-right">
                        <img
                            src={AboutImg}
                            alt="No image"
                            className="w-full h-80 object-cover rounded-lg"
                        />
                    </div>
                    <div data-aos="fade-left" className="flex flex-col gap-4">
                        <div className="p-4 border-l-4 border-primary">
                            <h3 className="text-2xl font-semibold mb-2">Us</h3>
                            <p className="text-sm dark:text-slate-400">
                            Policy Link Rwanda is a centralized system designed to collect and organize
                            policies from various institutions across Rwanda, ensuring easy access, 
                            consistency, and streamlined policy management for all stakeholders.
                            </p>
                        </div>
                        <div className="p-4 border-l-4 border-primary">
                            <h3 className="text-2xl font-semibold mb-2">Vision</h3>
                            <p className="text-sm dark:text-slate-400">
                                To create a unified platform that enhances transparency,
                                 accessibility, and efficiency in policy management across 
                                 Rwanda, fostering informed decision-making and collaborative governance.
                            </p>
                        </div>
                        <div className="p-4 border-l-4 border-primary">
                            <h3 className="text-2xl font-semibold mb-2">Mission</h3>
                            <p className="text-sm dark:text-slate-400">
                                To streamline the collection, organization, and dissemination of policies 
                                from diverse institutions, providing a reliable resource for policymakers, 
                                researchers, and the public, and promoting informed civic engagement.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </section>
    );
}

export default About;
