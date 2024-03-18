/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/

import React from 'react';
import Select from "react-select";
import "../assets/css/git-table.css"
import axios, {AxiosResponse} from 'axios';
import { Checkbox } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';



// npm install --save axios
// npm install --save @mui/icons-material
// npm install --legacy-peer-deps @mui/material
// npm install --legacy-peer-deps @rjsf/material-ui
// npm install --legacy-peer-deps @rjsf/core
// npm install @emotion/react
// npm install @emotion/st

export class GitTable extends React.Component <any, any> {

	constructor(props: any) {
	
		super(props);

		// allow access to var (this)
		this.checkBoxChange = this.checkBoxChange.bind(this);
		this.checkBoxChange = this.checkBoxChange.bind(this);
		this.handleLoadOptions = this.handleLoadOptions.bind(this);
		this.maybeLoadOptions = this.maybeLoadOptions.bind(this);
		this.onSelectChange = this.onSelectChange.bind(this);
		this.onSubmitEvt = this.onSubmitEvt.bind(this);
		
		this.state = {
			repositories: [],
			checked: '',
			optionsLoaded: false,
			options: {},
			setOptions: {},
			isLoading: {},
			repo: '',
			branch: ''
		};
    }
	
	componentWillMount() {

	}

	componentDidMount() {
		var self = this;
		self.repos(function(result:any) {
			if(result.length > 0) {
				self.setState({ repositories: result, checked:result[0].name, repo: result[0].name});
			} else {
				self.setState({ repositories: result });
			}
		});
	}
	
	componentDidUpdate() {

	}
	
	bytesToSize(x:any) {
		const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		let l = 0, n = parseInt(x, 10) || 0;
		while(n >= 1024 && ++l){
			n = n/1024;
		}
		return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
	}
	
	repos(callback:any) {
		var self = this;
		if(self.props.provider == 'github') {
			axios.get('https://api.github.com/search/repositories?q=user:' + self.props.username + '&per_page=100', {'headers': {"Authorization": `token ${self.props.token}`, "Content-Type": "application/json"}}).then((response: AxiosResponse) => {
				callback(response.data.items.map(function(item:any) {
					return {"type":self.props.provider, "name":item.name, "letter":item.name.substring(0, 1).toUpperCase(), "description":item.description, "stars":item.stargazers_count, "is_private":item.visibility, "size":item.size, "h_size":self.bytesToSize(item.size)};
				}));
			});
		}
		else if(self.props.provider == 'gitlab') {
		
			if(self.props.isGroup == 'true') {
				axios.get('https://gitlab.com/api/v4/groups/' + self.props.username + '/projects?private_token=' + self.props.token + '&statistics=true&per_page=100').then((response: AxiosResponse) => {
					callback(response.data.map(function(item:any) {
						return {"type":self.props.provider, "id":item.id, "name":item.path, "letter":item.path.substring(0, 1).toUpperCase(), "description":item.description, "stars":item.star_count, "is_private":item.visibility, "icon":item.avatar_url};
					}));
				});			
			} else {
				axios.get('https://gitlab.com/api/v4/users/' + self.props.username + '/projects?private_token=' + self.props.token + '&statistics=true&per_page=100').then((response: AxiosResponse) => {
					callback(response.data.map(function(item:any) {
						return {"type":self.props.provider, "id":item.id, "name":item.path, "letter":item.path.substring(0, 1).toUpperCase(), "description":item.description, "stars":item.star_count, "is_private":item.visibility, "size":item.statistics.repository_size, "h_size":self.bytesToSize(item.statistics.repository_size)};
					}));
				});			
			}
		} else if(self.props.provider == 'bitbucket') {
			var basicAuth = 'Basic ' + btoa(self.props.accountUsername+":"+self.props.token);
			axios.get('https://api.bitbucket.org/2.0/repositories/' + self.props.username, {'headers': {"Authorization": basicAuth, "Content-Type": "application/json"}}).then((response: AxiosResponse) => {
				callback(response.data.values.map(function(item:any) {
					return {"type":self.props.provider, "name":item.name, "letter":item.name.substring(0, 1).toUpperCase(), "description":item.description, "stars":0, "is_private":item.is_private ? 'private' : 'public', "size":item.size, "h_size":self.bytesToSize(item.size), "icon":item.links.avatar.href};
				}));
			});
		}
	}
	
	branchs(project_id:any, repo_name:any, callback:any) {
		var self = this;
		if(self.props.provider == 'github') {
			axios.get('https://api.github.com/repos/' + self.props.username + '/' + repo_name + '/branches?per_page=100', {'headers': {"Authorization": `token ${self.props.token}`, "Content-Type": "application/json"}}).then((response: AxiosResponse) => {
				callback(response.data.map(function(item:any) {
					return {"label":item.name, "value":item.name};
				}));
			}); 
		} else if(self.props.provider == 'gitlab') {
			axios.get('https://gitlab.com/api/v4/projects/' + project_id + '/repository/branches?private_token=' + self.props.token + '&per_page=100').then((response: AxiosResponse) => {
				callback(response.data.map(function(item:any) {
					return {"label":item.name, "value":item.name};
				}));
			});	
		} else if(self.props.provider == 'bitbucket') {
			var basicAuth = 'Basic ' + btoa(self.props.accountUsername+":"+self.props.token);
			axios.get('https://api.bitbucket.org/2.0/repositories/' + self.props.username + '/' + repo_name + '/refs/branches', {'headers': {"Authorization": basicAuth, "Content-Type": "application/json"}}).then((response: AxiosResponse) => {
				callback(response.data.values.map(function(item:any) {
					return {"label":item.name, "value":item.name};
				}));
			});
		}
	}
	
	getValue(repo_name:any) {
		var node = document.querySelector('div[data-name="'+repo_name+'"]');
		if(node) {
			var nodes = node.querySelectorAll("div");
			for (let i = 0; i < nodes.length; i++) {
				var x = nodes[i];
				var nodeClass = x.getAttribute('class');
				if(nodeClass) {
					if(nodeClass.includes('singleValue')) {
						return x.textContent;
					}
				}
			}
		}
		return null;
	}
	
	onSelectChange(e:any) {
		var obj:any = this.state.setOptions;
		obj[this.state.checked] = e;	
		this.setState({branch:e.label, setOptions:obj});
	}
	
	checkBoxChange(e:any) {
		var value = e.target.value;
		this.setState({repo:value, checked:value});
	}
	
	handleLoadOptions(project_id:any, repo_name:any) {
	
		var self = this;
		self.branchs(project_id, repo_name, function(result:any) {
		
			var options:any = self.state.options;
			var isLoading:any = self.state.isLoading;		
		
			options[repo_name] = result;
			isLoading[repo_name] = false;
			self.setState({optionsLoaded: true, options, isLoading: isLoading});			
		});
	};

	maybeLoadOptions(e:any) {
		
		var isLoading:any = this.state.isLoading;
		var value = e.target.closest('.git-table-select').getAttribute('data-name');
		var id = e.target.closest('.git-table-select').getAttribute('data-project');
		isLoading[value] = true;
		this.setState({ isLoading: isLoading });
		this.handleLoadOptions(id, value);
	}
	
	onSubmitEvt(e:any) {
		var project_id = document.querySelector("div[data-name='"+this.state.repo+"']").getAttribute('data-project');
		this.props.onSubmit({"repo":this.state.repo, "branch":this.getValue(this.state.repo), "project_id":project_id});
	}	
	
	listRepos() {
		var self = this;
		return (
			<table className="git-table" >
				<tr className="git-table-tr" >
				</tr>
				{this.state.repositories.map(function(item:any, i:any) {
					return(
						<tr className="git-table-tr" >
							<td className="git-table-td" >
								<Checkbox value={item.name} onChange={self.checkBoxChange} icon={<RadioButtonUncheckedIcon />} checkedIcon={<CheckCircleIcon />} checked={self.state.checked === item.name} />
							</td>
							<td className="git-table-td" >
								<div className="git-table-info" >
									<div className="git-table-img" >
										<img className="git-table-im" src="images/icon/repo.png" />
									</div>

								{ item.icon != null ? 
									<div className="git-table-icon" >
										<img className="git-table-icon-im" src={item.icon} />
									</div> : <div className="git-table-letter" >{item.letter}</div> }									

									<div className="git-table-i" >
										<div className="git-tb-i" >
											<div className="git-tb-i-name" >{item.name}</div>
											<div className="git-tb-i-img" >
												<img className="git-tb-i-im" src={"images/icon/" + item.is_private + ".png"} />
											</div>
										</div>
										<div className="git-table-i-des" >{item.description}</div>
									</div>
								</div>
							</td>
							<td className="git-table-td" >
								<div className="git-table-stars" >
									<div className="git-table-stars-img" >
										<img className="git-table-stars-im" src="images/icon/star.png" />
									</div>	
									<div className="git-table-stars-count" >{item.stars}</div>
								</div>
							</td>
							<td className="git-table-td" >
								<div className="git-table-size" >
									<div className="git-table-size-img" >
										<img className="git-table-size-im" src="images/icon/size.png" />
									</div>	
									<div className="git-table-size-count" >{item.h_size}</div>
								</div>
							</td>
							<td className="git-table-td" >
								<div data-name={item.name} data-project={item.id} className="git-table-select" >
									<Select
										inputId={item.name}
										isSearchable={true}
										defaultValue={{"label":"main", "value":"main"}}
										isLoading={self.state.isLoading[item.name]}
										options={self.state.options[item.name]}
										onFocus={self.maybeLoadOptions}
										components={{ IndicatorSeparator:() => null }}
										onChange={self.onSelectChange.bind(self)}
										value={self.state.setOptions[item.name]}
									/>
								</div>
							</td>
						</tr>
					);
				})}
			</table>
		);
	}
	
	
	render() {
		return (
			<div>
				{this.listRepos()}
				<div className="git-table-btns" >
					<button className="git-table-submit" onClick={this.onSubmitEvt} >Create</button>
					<button className="git-table-cancel" onClick={this.props.onCancel} >Go Back</button>
				</div>
			</div>
		);
	}
}