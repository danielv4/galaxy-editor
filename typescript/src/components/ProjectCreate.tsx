/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/


import React from 'react';
import Select from 'react-select';
import "../assets/css/project-create.css"
import { JSONSchema7 } from "json-schema";
import Form from '@rjsf/material-ui/v5';
import { GitTable } from "./GitTable";
import { v4 as uuidv4 } from 'uuid';



declare const window: any;

export class ProjectCreate extends React.Component <any, any> {

	constructor(props: any) {
	
		super(props);


		const FileWidget = (props:any) => {
			return (
				<div className="project-create-input" >
					<div className="project-create-input-d" >
						<div className="project-create-input-img" >
							<img className="project-create-input-im" src="images/icon/upload.png" />
						</div>
						<div className="project-create-input-text" >Upload Private Key</div>
					</div>
					<input className="project-create-input-fp" type="file" required={props.required} onChange={this.onChangeUploadData} />
				</div>
			);
		};


		const uiSchema = {
			private_key : {
				"ui:widget": FileWidget
			}
		};

	
		const schema: JSONSchema7 = {
		  "title": "New Project",
		  "type": "object",
		  "required": ["project_name", "path", "project_type"],
		  "properties": {
			"project_name": {
			  "type": "string",
			  "title": "Project Name",
			  "default": "project-1"
			},
			"path": {
			  "type": "string",
			  "title": "Project Path",
			  "default": "/"
			},
			"project_type": {
				"type": "string",
				"title": "Project Type",
				"default": "Local",
				"enum": [
					"Local",
					"Github",
					"Bitbucket",
					"Gitlab",
					"SFTP"
				]
			}
		  },
		  "allOf": [
		    {
			  "if": {
				"properties": {
				  "project_type": {
					"const": "Github"
				  }
				}
			   },
				"then": {
					"required": ["username", "personal_access_token"],
					"properties": {
						"username": {
						  "type": "string",
						  "title": "Username",
						  "default": "user-1"
						},
						"personal_access_token": {
						  "type": "string",
						  "title": "Personal Access Token",
						  "format": "password",
						  "default": "user-1"
						}						
					}
				},
			},
		    {
			  "if": {
				"properties": {
				  "project_type": {
					"const": "Bitbucket"
				  }
				}
			   },
				"then": {
					"required": ["username", "personal_access_token"],
					"properties": {
						"username": {
						  "type": "string",
						  "title": "Username",
						  "default": "user-1"
						},
						"account_username": {
						  "type": "string",
						  "title": "Account Username",
						  "default": "user-1"
						},
						"personal_access_token": {
						  "type": "string",
						  "title": "Personal Access Token",
						  "format": "password",
						  "default": "user-1"
						}						
					}
				},
			},
		    {
			  "if": {
				"properties": {
				  "project_type": {
					"const": "Gitlab"
				  }
				}
			   },
				"then": {
					"required": ["username", "personal_access_token"],
					"properties": {
						"username": {
						  "type": "string",
						  "title": "Username",
						  "default": "user-1"
						},
						"personal_access_token": {
						  "type": "string",
						  "title": "Personal Access Token",
						  "format": "password",
						  "default": "user-1"
						},
						"is_group": {
							"type": "boolean",
							"title": "Group",
							"default": false
						}
					}
				},
			},
			{
			  "if": {
				"properties": {
				  "project_type": {
					"const": "SFTP"
				  }
				}
			   },
				"then": {
					"required": ["host", "username", "port"],
					"properties": {
						"host": {
						  "type": "string",
						  "title": "Host",
						  "default": "127.0.0.1"
						},
						"username": {
						  "type": "string",
						  "title": "Username",
						  "default": "root"
						},
						"port": {
						  "type": "number",
						  "title": "Port",
						  "default": 22
						},
						"authentication_type": {
							"type": "string",
							"title": "Authentication Type",
							"default": "Private Key",
							"enum": [
								"Private Key",
								"Password"
							]
						}
					},
					 "allOf": [
								{
								  "if": {
									"properties": {
									  "authentication_type": {
										"const": "Private Key"
									  }
									}
								   },
									"then": {
										"properties": {
											"private_key": {
											  "type": "string",
											  "title": "Private Key",
											}
										}
									}
								},
								{
								  "if": {
									"properties": {
									  "authentication_type": {
										"const": "Password"
									  }
									}
								   },
									"then": {
										"required": ["password"],
										"properties": {
											"password": {
											  "type": "string",
											  "title": "Password",
											  "format": "password"
											}
										}
									}
								},
						]
				}			
			}
			]
		};		
		

		this.state = {
			uiSchema: uiSchema,
			schema: schema,
			formData: {},
			show: 'form',
			repositories: [],
			projectType: 'github'
		};


		// allow access to var this
		this.onNextEvt = this.onNextEvt.bind(this);	
		this.onChangeUploadData = this.onChangeUploadData.bind(this);
		this.onCancelProject = this.onCancelProject.bind(this);
		this.onSubmitEvt = this.onSubmitEvt.bind(this);
		
    }
	
	componentWillMount() {

	}

	componentDidMount() {

	}
	
	componentDidUpdate() {

	}
	
	onCancelProject(event:any) {	
		this.setState({show:"form", repositories: []});
	}
	
	formatFormData(data:any) {
	
		var obj:any = {};
		obj["id"] = uuidv4();
		obj["name"] = data["project_name"];
		obj["path"] = data["path"];
		
		if(data.project_type == 'Local') {
			obj["type"] = "local";
		} else if(data.project_type == 'SFTP') {
			obj["type"] = "sftp";
			obj["privateKey"] = data["private_key"];
			obj["host"] = data["host"];
			obj["port"] = data["port"];
			obj["username"] = data["username"];
			obj["authentication_type"] = data["authentication_type"];
			obj["password"] = data["password"];
		} else if(data.project_type == 'Bitbucket') {
			obj["type"] = "bitbucket";
			obj["key"] = data["account_username"]+":"+data["personal_access_token"];
			obj["username"] = data["username"];
			obj["repo"] = data["repo"];
			obj["branch"] = data["branch"];
		} else if(data.project_type == 'Github') {
			obj["type"] = "github";
			obj["key"] = data["personal_access_token"];
			obj["username"] = data["username"];
			obj["repo"] = data["repo"];
			obj["branch"] = data["branch"];
		} else if(data.project_type == 'Gitlab') {
			obj["type"] = "gitlab";
			obj["key"] = data["personal_access_token"];
			obj["username"] = data["username"];
			obj["is_group"] = data["is_group"];
			obj["repo"] = data["repo"];
			obj["branch"] = data["branch"];
			obj["project_id"] = data["project_id"];
		}

		return obj;
	}
	
	onSubmitEvt(obj:any) {

		var self = this;
		var data = self.state.formData;
		data["repo"] = obj.repo;
		data["branch"] = obj.branch;
		data["project_id"] = obj.project_id;
		self.setState({"formData":data});
		self.props.onSubmit(self.formatFormData(data));
	}
	
	onNextEvt(obj:any) {
	
		var self = this;
	
		if(obj.formData.project_type == 'Local') {
			self.props.onSubmit(self.formatFormData(obj.formData));
		} else if (obj.formData.project_type == 'SFTP') {
			self.props.onSubmit(self.formatFormData(obj.formData));
		} else {
			self.setState({show:"loader"});
			setTimeout(function(){ 
				self.setState({show:"repositories"});
			}, 4000);
		}
	}
	
	onChangeUploadData(event:any) {
		var self = this;
		var file = event.target.files[0];
		var reader = new FileReader();
		reader.onload = function(){
			var data = self.state.formData;
			data["private_key"] = reader.result;
			self.setState({"formData":data});
        };	
		reader.readAsText(file);
    }
	
	render() {
		return (
			<div>
				{(() => {
					if (this.state.show == 'form') {
					  return (
						<Form
						uiSchema={this.state.uiSchema}
						schema={this.state.schema}
						onSubmit={this.onNextEvt}
						formData={this.state.formData} 
						onChange={({formData}) => this.setState({formData})} >
							<div>
								<button className="project-form-next" type="submit" >Next</button>
								<button className="project-form-cancel" onClick={this.props.onProjectCancel} >Cancel</button>
							</div>
					   </Form>
					  )
					} else if (this.state.show == 'loader') {
					  return (
						<div className="wrapper">
						  <span className="dot"></span>
						  <div className="dots">
							<span></span>
							<span></span>
							<span></span>
						  </div>
						</div>
					  )
					} else if (this.state.show == 'repositories') {

					  return (
					    <div className="project-create-git" >
							<div className="project-create-git-text" >Repositories</div>
							<GitTable provider={this.state.formData.project_type.toLowerCase()} onSubmit={this.onSubmitEvt} onCancel={this.onCancelProject} username={this.state.formData.username} accountUsername={this.state.formData.account_username} isGroup={this.state.formData.is_group.toString()} token={this.state.formData.personal_access_token} />
						</div>
					  )
					}
				})()}
			</div>
		);
	}
}