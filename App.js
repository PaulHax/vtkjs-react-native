import React from "react";
import { View, Text } from "react-native";
import { GLView } from "expo-gl";

import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
// import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";
// import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";

import "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";

const noop = () => {};

const SIZE = { width: 300, height: 300 };

export default function App() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>vtk.js</Text>
      <GLView
        style={{ ...SIZE, borderWidth: 5 }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

const onContextCreate = (gl) => {
  // ----------------------------------------------------------------------------
  // Standard rendering code setup
  // ----------------------------------------------------------------------------

  const renderWindow = vtkRenderWindow.newInstance();
  const renderer = vtkRenderer.newInstance({ background: [1.0, 0.0, 0.0] });
  renderWindow.addRenderer(renderer);

  // ----------------------------------------------------------------------------
  // Simple pipeline ConeSource --> Mapper --> Actor
  // ----------------------------------------------------------------------------

  const coneSource = vtkConeSource.newInstance({ height: 1.0 });

  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(coneSource.getOutputPort());

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);

  // ----------------------------------------------------------------------------
  // Add the actor to the renderer and set the camera based on it
  // ----------------------------------------------------------------------------

  renderer.addActor(actor);
  renderer.resetCamera();

  // ----------------------------------------------------------------------------
  // Use OpenGL as the backend to view the all this
  // ----------------------------------------------------------------------------

  const canvasShim = {
    style: {},
    setAttribute: noop,
    getContext: () => gl,
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  global.document = { createElement: () => canvasShim };
  global.WebGL2RenderingContext = {};

  global.Image = class Image {
    style = {};
  };

  const apiSpecificRenderWindow = renderWindow.newAPISpecificView("WebGL");
  renderWindow.addView(apiSpecificRenderWindow);

  // ----------------------------------------------------------------------------
  // Create a div section to put this into
  // ----------------------------------------------------------------------------

  const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
  const containerShim = {
    appendChild: noop,
    style: {},
    getBoundingClientRect: () => {
      width, height;
    },
  };
  apiSpecificRenderWindow.setContainer(containerShim);

  // ----------------------------------------------------------------------------
  // Capture size of the container and set it to the renderWindow
  // ----------------------------------------------------------------------------

  apiSpecificRenderWindow.setSize(width, height);

  // animation loop
  const render = () => {
    timeout = requestAnimationFrame(render);

    renderer.getActiveCamera().azimuth(0.25);
    renderer.resetCameraClippingRange();
    renderWindow.render();

    gl.endFrameEXP(); // like swapbuffers
  };
  render();

  // ----------------------------------------------------------------------------
  // Setup an interactor to handle mouse events
  // ----------------------------------------------------------------------------

  // const interactor = vtkRenderWindowInteractor.newInstance();
  // interactor.setView(apiSpecificRenderWindow);
  // interactor.initialize();
  // interactor.bindEvents(containerShim);

  // ----------------------------------------------------------------------------
  // Setup interactor style to use
  // ----------------------------------------------------------------------------

  // interactor.setInteractorStyle(
  //   vtkInteractorStyleTrackballCamera.newInstance()
  // );
};
