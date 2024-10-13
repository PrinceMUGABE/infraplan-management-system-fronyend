import React from "react";
import { FaCameraRetro } from "react-icons/fa";
import { GiNotebook } from "react-icons/gi";
import { SlNote } from "react-icons/sl";

const skillsData = [
  {
    name: "Updated Policy",
    icon: <FaCameraRetro className="text-4xl text-primary" />,
    link: "#",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad distinctio dignissimos ea eum, tenetur id ullam ex doloremque enim aspernatur vitae quam modi sequi velit libero nemo maiores in voluptatum.",
    aosDelay: "0",
  },
  {
    name: "Updated Policy",
    icon: <GiNotebook className="text-4xl text-primary" />,
    link: "#",
    description:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad distinctio dignissimos ea eum, tenetur id ullam ex doloremque enim aspernatur vitae quam modi sequi velit libero nemo maiores in voluptatum.",
    aosDelay: "300",
  },
  {
    name: "Updated Policy",
    icon: <SlNote className="text-4xl text-primary" />,
    link: "#",
    description:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad distinctio dignissimos ea eum, tenetur id ullam ex doloremque enim aspernatur vitae quam modi sequi velit libero nemo maiores in voluptatum.",
    aosDelay: "500",
  },
  {
    name: "Updated Policy",
    icon: <SlNote className="text-4xl text-primary" />,
    link: "#",
    description:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad distinctio dignissimos ea eum, tenetur id ullam ex doloremque enim aspernatur vitae quam modi sequi velit libero nemo maiores in voluptatum.",
    aosDelay: "700",
  },
];
const Services = () => {
  return (
    <>

      <section id="service">

      <div className="bg-gray-100 dark:bg-black dark:text-white py-12 sm:grid sm:place-items-center">
        <div className="container">
          {/* Header */}
          <div className="pb-12 text-center space-y-3">
            <h1
              data-aos="fade-up"
              className="text-3xl font-semibold sm:text-3xl text-violet-950 dark:text-primary"
            >
              Explore Our Services
            </h1>
            <p
              data-aos="fade-up"
              className="text-gray-600 dark:text-gray-400 text-sm"
            >
              We are setting up an updated police
              visually.
            </p>
          </div>

          {/* services cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {skillsData.map((skill) => (
              <div
                key={skill.name}
                data-aos="fade-up"
                data-aos-delay={skill.aosDelay}
                className="card space-y-3 sm:space-y-4 p-4"
              >
                <div>{skill.icon}</div>
                <h1 className="text-lg font-semibold">{skill.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {skill.description}
                </p>
              </div>
            ))}
          </div>

          {/* button */}
          {/* <div
            data-aos="fade-up"
            data-aos-delay="900"
            data-aos-offset="0"
            className="text-center mt-4 sm:mt-8"
          >
            <button className="primary-btn">Learn More</button>
          </div> */}
        </div>
      </div>

      </section>
     
    </>
  );
};

export default Services;
