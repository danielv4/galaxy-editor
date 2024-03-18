/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/

import React, { Component } from "react";

import {
    Menu,
    MenuItem,
    MenuButton,
	MenuDivider,
	MenuHeader,
	SubMenu,
	MenuRadioGroup
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';


declare const window: any;

export class MainMenu extends React.Component <any, any> {

	constructor(props: any) {
        super(props);
    }

	// before the component mounts, we initialise our state
	componentWillMount() {
		
	}

	// after the component did mount, we set the state each second.
	componentDidMount() {

	}
	
	componentDidUpdate() {

	}
	
    render(): JSX.Element {
	
		var self = this;
	
        return (
			<div className="main-menu" >
			
				<div className="main-menu-img" >
					<img className="main-menu-im" src="images/logo.png" />
				</div>
			
				<Menu menuButton={<MenuButton>File</MenuButton>}>
					<MenuItem value="new" onClick={this.props.onClick} >New</MenuItem>
					<MenuItem value="open" onClick={this.props.onClick} >Open...</MenuItem>
					<MenuDivider />
					<MenuItem value="close" onClick={this.props.onClick} >Close</MenuItem>
					<MenuItem value="close-all" onClick={this.props.onClick} >Close All</MenuItem>
					<MenuItem value="save" onClick={this.props.onClick} >Save</MenuItem>
					<MenuDivider />
					<MenuItem value="account" onClick={this.props.onClick} >Account</MenuItem>
					<MenuDivider />
					<MenuItem value="exit" onClick={this.props.onClick} >Exit</MenuItem>
				</Menu>
				
				<Menu menuButton={<MenuButton>Edit</MenuButton>}>
					<MenuItem value="undo" onClick={this.props.onClick} >Undo</MenuItem>
					<MenuItem value="redo" onClick={this.props.onClick} >Redo</MenuItem>
					<MenuDivider />
					<MenuItem value="cut" onClick={this.props.onClick} >Cut</MenuItem>
					<MenuItem value="copy" onClick={this.props.onClick} >Copy</MenuItem>
					<MenuItem value="paste" onClick={this.props.onClick} >Paste</MenuItem>
				</Menu>
				
				<Menu menuButton={<MenuButton>Project</MenuButton>} >
					<MenuItem value="new-project" onClick={this.props.onClick} >New Project</MenuItem>
					<MenuDivider />
					<MenuHeader>Projects</MenuHeader>
					{self.props.projects.map(function(item:any, i:any) {
						if(i < 10) {
							return (
								<MenuItem value={item.id} onClick={self.props.onClick} >{item.name}</MenuItem>
							);
						}
					})}
				</Menu>
				
				<Menu menuButton={<MenuButton>View</MenuButton>}>

					<MenuItem value="word-wrap" onClick={this.props.onClick} >Word Wrap</MenuItem>
					<MenuItem value="zoom" onClick={this.props.onClick} >Zoom</MenuItem>

				</Menu>

				<Menu menuButton={<MenuButton>Settings</MenuButton>}>
					<MenuItem value="settings" onClick={this.props.onClick} >Open Settings</MenuItem>
				</Menu>
				
				<div className="main-menu-title" >Galaxy Editor</div>
				
				<div className="s-window-controls">
					<div className="s-window-controls-m">
						<div onClick={function(e:any) { self.props.onClick({'value':'minimize'}); }} className="s-window-control-d">
							<div className="s-window-control-d-line"></div>
						</div>	
						<div onClick={function(e:any) { self.props.onClick({'value':'maximize'}); }} className="s-window-control-d">
							<div className="s-window-control-sq"></div>
						</div>					
						<div onClick={function(e:any) { self.props.onClick({'value':'close-app'}); }} className="s-window-control-d">
							<img className="s-window-control-exit" src="images/menu/close_.png" />
						</div>
					</div>
				</div>
			</div>		
        );
    }
}