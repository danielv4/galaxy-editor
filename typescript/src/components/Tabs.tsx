/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/

import React, { Component } from "react";

var ChromeTabs = require("chrome-tabs");
import '../assets/css/tabs.css'


declare const window: any;

export class Tabs extends React.Component <any, any> {

	constructor(props: any) {
        super(props);
		
		window.TabsIpc = this;
		
		this.state = {
			'chromeTabs': null
		};	
    }

	// before the component mounts, we initialise our state
	componentWillMount() {
		
	}

	// after the component did mount, we set the state each second.
	componentDidMount() {
	
		var self = this;
		var el = document.querySelector('.chrome-tabs');
		
		if (el !== undefined) {
		
			var chromeTabs = new ChromeTabs();
			chromeTabs.init(el);
			self.setState({"chromeTabs" : chromeTabs});
			
			el.addEventListener('activeTabChange', function(detail:any) {
				self.props.onActiveTabChange(detail);
			});		
			
			el.addEventListener('tabAdd', function(detail:any) {
				self.props.onTabAdd(detail);
			});			
		
			el.addEventListener('tabRemove', function(detail:any) {
				self.props.onTabRemove(detail);
			});
		}
	}
	
	componentDidUpdate() {

	}
	
	addTab(id:any, title:any, icon:any) {
		var self = this;
		self.state.chromeTabs.addTab({
			'id':id,
			'title': title,
			'favicon': icon
		});
	}
	
	setCurrentTab(el:any) {
		var self = this;
		self.state.chromeTabs.setCurrentTab(el);
	}
	
    render(): JSX.Element {
        return (
			<div className="chrome-tabs" >
				<div className="chrome-tabs-content"></div>
			</div>		
        );
    }
}