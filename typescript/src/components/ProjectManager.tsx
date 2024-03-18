/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/


import React from 'react';
import Select from 'react-select';



declare const window: any;

export class ProjectManager extends React.Component <any, any> {

	constructor(props: any) {
	
		super(props);
		
		this.state = {
			id: "",
			name: ''
		};
		
		// allow access to var this
		this.loadOptions = this.loadOptions.bind(this);			
		
    }
	
	componentWillMount() {

	}

	componentDidMount() {

	}
	
	componentDidUpdate() {

	}
	
	loadOptions() {
	
		var self = this;
		var arr = [];
		for (let i = 0; i < self.props.projects.length; i++) {
			var item = self.props.projects[i];
			var value = item.id;
			var name = item.name;
			var icon = "images/project/" + item.type + ".png";
			var obj = { value: {value}, label: 
				<div className="sel-i" >
					<div className="sel-img" >
						<img className="sel-im" src={icon} />
					</div>
					<div className="sel-text" >{name}</div>
				</div> }
			arr.push(obj);
		}
		return arr;
	}
	
	loadValue() {
		var self = this;
		var item = self.props.project;
		var value = item.id;
		var name = item.name;
		var icon = "images/project/" + item.type + ".png";	
		var obj = { value: {value}, label: 
			<div className="sel-i" >
				<div className="sel-img" >
					<img className="sel-im" src={icon} />
				</div>
				<div className="sel-text" >{name}</div>
			</div> }
		return obj;
	}
	
	handleChange(e:any){
		this.setState({id:e.value, name:e.label});
		this.props.onChange(e.value.value);
	}
	
	render() {
		return (
			<Select
				value={this.loadValue()}
				placeholder={<div className="sel-placeholder" >Choose Project</div>}
				classNamePrefix='filter'
				styles={{
					control: (provided, state) => ({
					  ...provided,
					  background: "none",
					  boxShadow: "none",
					  border: "0px"
					}),
					menuList: (base) => ({
						...base,
						background: "none",
						"::-webkit-scrollbar": {
						  width: "4px",
						  height: "0px",
						},
						"::-webkit-scrollbar-track": {
						  background: "#f1f1f1"
						},
						"::-webkit-scrollbar-thumb": {
						  background: "#888"
						},
						"::-webkit-scrollbar-thumb:hover": {
						  background: "#555"
						},
						padding: 0
					})
				  }}
				isSearchable={false}
				components={{ IndicatorSeparator:() => null }}
				onChange={this.handleChange.bind(this)}
				options={this.loadOptions()}
			/>
		);
	}
}