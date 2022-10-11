import React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent, screen } from "@testing-library/react";
import  "@testing-library/jest-dom/extend-expect"
import renderer from "react-test-renderer";

import { ContextMenu } from "../Components/ContextMenu";
it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<p> Hi! </p>, div )
})

it("renders correctly", () => {
    const {getByTestId} = render(<ContextMenu> </ContextMenu>)
    expect(getByTestId("ContextMenu")).toHaveTextContent("Open Text Extraction");
})

it("matches snapshot", () => {
    const tree = renderer.create(<ContextMenu> </ContextMenu>).toJSON();
    expect(tree).toMatchSnapshot();
})