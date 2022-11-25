import React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent, screen, findByTestId, createEvent, getByRole, getByTestId} from "@testing-library/react";
import  "@testing-library/jest-dom/extend-expect"
import renderer from "react-test-renderer";

import { ContextMenu } from "../Components/ContextMenu";
import { VideoApp } from "../VideoApp"


describe('ContextMenu', () => {

   it("renders correctly", () => {
        const {getByTestId} = render(<ContextMenu> </ContextMenu>)
        expect(getByTestId("ContextMenu")).toHaveTextContent("Open Text Extraction");
    })

    it("matches snapshot", () => {
        const tree = renderer.create(<ContextMenu> </ContextMenu>).toJSON();
        expect(tree).toMatchSnapshot();
    })

    it("opens context menu on right click", () => {
        render(<VideoApp> </VideoApp>);
        const canvas = screen.getByTestId("Canvas");
        fireEvent.contextMenu(canvas); 
        const contextMenu = screen.getByText("Open Text Extraction");
        expect(contextMenu).toBeInTheDocument();
    })

    it("closes App menu on left click", () => {
        render(<VideoApp> </VideoApp>);
        const canvas = screen.getByTestId("Canvas");
        fireEvent.contextMenu(canvas);
        fireEvent.click(canvas);
        const contextMenu = screen.queryByText("Open Text Extraction");
        expect(contextMenu).not.toBeInTheDocument();
    })

});

/**
 *     
 */