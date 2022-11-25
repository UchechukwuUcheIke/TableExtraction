import React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent, screen } from "@testing-library/react";
import  "@testing-library/jest-dom/extend-expect"
import renderer from "react-test-renderer";

import { Menu } from "../Components/AppMenu";

describe('AppMenu', () => {
    it("renders correctly", () => {
        const {getByTestId} = render(<Menu> </Menu>)
        expect(getByTestId("ContextMenu")).toHaveTextContent("Option Select");
    })

    it("matches snapshot", () => {
        const tree = renderer.create(<Menu> </Menu>).toJSON();
        expect(tree).toMatchSnapshot();
    })
});
