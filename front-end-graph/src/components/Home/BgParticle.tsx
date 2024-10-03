"use client";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import React, { useEffect, useMemo, useState } from "react";
import { loadSlim } from "@tsparticles/slim";
import { IS_DEVELOPMENT } from "../utils";

export const BGParticle = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    IS_DEVELOPMENT && console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      particles: {
        number: {
          value: 33, // Number of nodes (particles)
          density: {
            enable: true,
            value_area: 1578.2952832645453,
          },
        },
        color: {
          value: "#262a34", // Color of the nodes (particles)
        },
        shape: {
          type: "circle", // Shape of the nodes
          stroke: {
            width: 0,
            color: "#000000",
          },
          polygon: {
            nb_sides: 5,
          },
          image: {
            src: "img/github.svg",
            width: 100,
            height: 100,
          },
        },
        opacity: {
          value: 1,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 10, // Size of the nodes (particles)
          random: false,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false,
          },
        },
        links: {
          // Updated from line_linked to links
          enable: true, // Enables lines between the nodes
          distance: 300, // Distance between the nodes for edges (connected lines)
          color: "#1e1e1e", // Color of the connected lines
          opacity: 0.6, // Opacity of the edges
          width: 2, // Width of the edges
        },
        move: {
          enable: true,
          speed: 1.3,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true, // Enables interaction on hover
            mode: "grab", // Shows edges more clearly when you hover over particles
          },
          onclick: {
            enable: false,
            mode: "push",
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 200, // Distance for the grab effect
            links: {
              opacity: 0.8, // Makes lines more visible on hover
            },
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
      fullScreen: {
        enable: true,
        zIndex: -15,
      },
    }),
    [],
  );

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    );
  }

  return <></>;
};
