/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/


import React from 'react';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';


export class Settings extends React.Component <any, any> {

	constructor(props: any) {
	
		super(props);

		this.state = {
			theme: this.props.theme,
			wordWrap: this.props.wordWrap,
			settings: 'projects',
			projects: this.props.projects,
			zoom: 10,
		};
		
		// allow access to var (this)
		this.onChangeTheme = this.onChangeTheme.bind(this);
		this.onSettings = this.onSettings.bind(this);
		this.onWordWrap = this.onWordWrap.bind(this);
		this.handleChange = this.handleChange.bind(this);
    }
	
	componentWillMount() {

	}

	componentDidMount() {

	}
	
	componentDidUpdate() {

	}
	
	onChangeTheme(event:any) {
		this.setState({"theme": event.target.checked});
		this.props.onChangeTheme(event.target.checked);
	}
	
	onWordWrap(event:any) {
		this.setState({"wordWrap": event.target.checked});
		this.props.onWordWrap(event.target.checked);
	}
	
	onSettings(event:any) {
		this.setState({"settings": event.value});
	}
	
	componentWillReceiveProps(nextProps:any) {

		var self = this;
		// only update when projects is changed
		if(nextProps.projects !== self.props.projects) {
			this.setState({projects:nextProps.projects});
		}
	}
	
	listProjects() {
		var self = this;
		return (
			<div className="settings-projects" >
				<div className="settings-title" >Manage Projects</div>
				<table className="settings-projects-tb" >
					{self.state.projects.map(function(item:any, i:any) {
						return(
							<tr className="settings-tr" >
								<td className="settings-td-icon" >
									<div className="settings-td-img" >
										<img className="settings-td-im" src={"images/project/"+item.type+".png"} />
									</div>
									<div className="settings-td-text" >{item.name}</div>
								</td>
								<td>
									<div className="settings-td-item-x" >{item.type.toUpperCase()}</div>
								</td>
								<td>
									<div className="settings-td-item" >{item.path}</div>
								</td>
								
								
								{(() => {
									if (item.id == 'default') {
										return (
											<td className="settings-td-e" >
												<div onClick={function(e:any) { self.props.onOpen({'id':item.id}); }} className="settings-td-btn1" >
													<div className="settings-td-open" >Open</div>
												</div>
											</td>
										);									
									} else {
										return (
											<td className="settings-td-e" >
												<div onClick={function(e:any) { self.props.onOpen({'id':item.id}); }} className="settings-td-btn1" >
													<div className="settings-td-open" >Open</div>
												</div>
												<div onClick={function(e:any) { self.props.onDelete({'id':item.id}); }} className="settings-td-btn2" >
													<div className="settings-td-del" >Delete</div>
												</div>
											</td>
										);
									}
								})()}

								
							</tr>
						);
					})}
				</table>
			</div>
		);
	}
	
	handleChange(event: Event, newValue: number | number[]) {
		if (typeof newValue === 'number') {
			this.setState({"zoom":newValue});
		}
	}
	
	render() {
		var self = this;
		return (
			<div className="settings" >
				<div className="settings-menu-v1" >
					<div onClick={function(e:any) { self.onSettings({'value':'projects'}); }} className="settings-item" >
						<div className="settings-item-img" >
							<img className="settings-item-im" src="images/icon/projects.png" />
						</div>
						<div className="settings-item-text" >Projects</div>
					</div>
					<div onClick={function(e:any) { self.onSettings({'value':'theme'}); }} className="settings-item" >
						<div className="settings-item-img" >
							<img className="settings-item-im" src="images/icon/theme.png" />
						</div>
						<div className="settings-item-text" >Theme</div>
					</div>
					<div onClick={function(e:any) { self.onSettings({'value':'language'}); }} className="settings-item" >
						<div className="settings-item-img" >
							<img className="settings-item-im" src="images/icon/lang.png" />
						</div>
						<div className="settings-item-text" >Settings</div>
					</div>
				</div>	
				<div className="settings-menu-v2" >
				{(() => {
					if (this.state.settings == 'projects') {
						return (
							<div>
								<div>{this.listProjects()}</div>
							</div>
						);
					} else if (this.state.settings == 'theme') {
						return (
							<div className="settings-projects" >
								<div className="settings-title" >Customization</div>
								<div className="settings-item-v2" >
									<div className="settings-option-mode" >
										<div className="settings-option-mode-text" >Enable Dark Mode</div>
											<Switch 
												onChange={this.onChangeTheme}
												checked={this.state.theme}
												inputProps={{ 'aria-label': 'controlled' }} />
									</div>
								</div>
							</div>
						);					
					} else if (this.state.settings == 'language') {
						return (
							<div className="settings-projects" >
								<div className="settings-title" >Editor Settings</div>
								<div className="settings-item-v2" >
									<div className="settings-option-mode" >
										<div className="settings-option-mode-text" >Enable WordWrap</div>
											<Switch 
												onChange={this.onWordWrap}
												checked={this.state.wordWrap}
												inputProps={{ 'aria-label': 'controlled' }} />
									</div>
								</div>
							</div>
						);
					}
				})()}
				</div>		
			</div>
		);
	}
}