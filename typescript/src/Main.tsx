/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/

import React, { Component } from "react";
import { App } from "./App";

import { FileTree } from "./components/FileTree";
import { Tabs } from "./components/Tabs";
import { ProjectManager } from "./components/ProjectManager";
import { MainMenu } from "./components/MainMenu";
import { ProjectCreate } from "./components/ProjectCreate";
import { v4 as uuidv4 } from 'uuid';
import { Settings } from "./components/Settings";
import {Helmet} from "react-helmet";


import './assets/css/main.css'
import './assets/css/project-manager.css'

import SplitPane from "react-split-pane";
import Editor from "@monaco-editor/react";
const $ = require('jquery');


// npm install --save @monaco-editor/react



declare const window: any;

export class Main extends Component<any, any> {

	editorRef: any;

	constructor(props:any) {
        super(props);	

		// state
        this.state = { 
			"nodes": [],
			"editordata": "",
			"activeTab": null,
			"files": [],
			"file": {},
			"projects": [],
			"project": {},
			"show": "main",
			"newFileCount": 0,
			"settings": "main",
			"contextMenuNode": null,
			"uploading": false,
			"uploadingSize": 0,
			"uploadingCount": 0,
			"uploadInfo": {},
			"theme": false,
			"editor": null,
			"monaco":null,
			"wordWrap":false,
			"account":"block"
		};	
		
		window.Main = this;
		
		// allow access to var (this)
		this.onMenuClick = this.onMenuClick.bind(this);
		this.onActiveTabChangeEvt = this.onActiveTabChangeEvt.bind(this);
		this.onChangeEvt = this.onChangeEvt.bind(this);
		this.onFileReadEvt = this.onFileReadEvt.bind(this);
		this.onProjectCancelEvt = this.onProjectCancelEvt.bind(this);
		this.onSubmitEvt = this.onSubmitEvt.bind(this);
		this.getOpenFiles = this.getOpenFiles.bind(this);
		this.newFile = this.newFile.bind(this);
		this.closeFile = this.closeFile.bind(this);
		this.onTabRemoveEvt = this.onTabRemoveEvt.bind(this);
		this.closeAllFiles = this.closeAllFiles.bind(this);
		this.saveFile = this.saveFile.bind(this);
		this.onEditorChange = this.onEditorChange.bind(this);
		this.onEditorDidMount = this.onEditorDidMount.bind(this);
		this.onUploadEvt = this.onUploadEvt.bind(this);
		this.onCtxClick = this.onCtxClick.bind(this);
		this.onCtxValue = this.onCtxValue.bind(this);	
		this.onRenameEvt = this.onRenameEvt.bind(this);	
		this.onOpenEvt = this.onOpenEvt.bind(this);	
		this.onDeleteEvt = this.onDeleteEvt.bind(this);	
		this.onUploadInfoEvt = this.onUploadInfoEvt.bind(this);	
		this.onChangeThemeEvt = this.onChangeThemeEvt.bind(this);	
		this.onWordWrapEvt = this.onWordWrapEvt.bind(this);	
		
		
		
		// ref
		this.editorRef = React.createRef();
    }

	componentWillMount() {
		
	}

	componentDidMount() {
	
		// startup & loads projects
		var self = this;
		window.api.send('startup', true);		
		window.api.on('startup-data', (event: any, args: any) => {	
			var arr = args.projects;
			self.setState({"projects":arr, "project":arr[0]});
		});
		
		// (should keep Listeners here) MaxListenersExceededWarning
		window.api.on('readfile-data', (event: any, obj: any) => {
			self.setState((previousState:any) => ({
				files: [...previousState.files, {"id":obj.key + "?type=" + self.state.project.type + "&id=" + self.state.project.id, "value":obj.value, "language":obj.language}],
				file:{"id":obj.key + "?type=" + self.state.project.type + "&id=" + self.state.project.id, "value":obj.value, "language":obj.language}
			}));
		});
		
		window.api.on('project-delete-data', (event: any, args: any) => {	
			var arr = args.projects;
			if(arr) {
				self.setState({"projects":arr, "project":arr[0]});
				window.api.send('tree-init', {"project":arr[0]});
			}
		});
		
		window.api.on('auth-info', (event: any, args: any) => {	
			if(args.login == true && args.expired == 'false') {
				$(".account-view").css({"visibility":"hidden"});
			}
			
			if(args.navigation == 'show-main') {
				$(".account-view").css({"visibility":"hidden"});
			}
		});	
	}
	
	componentDidUpdate() {
	
		$(document).on('mouseover', '.Resizer.vertical', function() {
			$(".presentation-s3").css({"background-color":"rgb(0 96 223)"});
			$(".Resizer.vertical").css({"border-left":"1px solid rgb(0 96 223)"});
		});
		
		$(document).on('mouseout', '.Resizer.vertical', function() {
			$(".presentation-s3").css({"background-color":"rgb(204, 204, 204)"});
			$(".Resizer.vertical").css({"border-left":"1px solid rgb(224 224 224)"});
		});	

		if(this.state.theme == true) {
			if(this.state.monaco) {
				this.state.monaco.editor.setTheme('vs-dark');
			}
		} else {
			if(this.state.monaco) {
				this.state.monaco.editor.setTheme('vs');
			}
		}
		
		if(this.state.editor) {
			this.editorRef.current.updateOptions({ wordWrap: this.state.WordWrap ? 'on' : 'off' });
		}
	}
	
	onEditorChange(value:any, event:any) {

	}	
	
	onEditorDidMount(editor:any, monaco:any) {
		this.editorRef.current = editor;
		this.setState({"editor":editor, "monaco":monaco});
	}		
	
	getOpenFiles() {
		var arr = [];
		var nodes = document.querySelectorAll("div[data-tab-id]");
		for (let i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			arr.push(node.getAttribute('data-tab-id'));
		}
		return arr;
	}
	
	newFile() {
		var self = this;
		var key = "/new "+self.state.newFileCount+".txt?id="+uuidv4()+"&type=NEW";
		window.TabsIpc.addTab(key, "New "+self.state.newFileCount, "images/ext/txt.png");
		self.setState((previousState:any) => ({
			files: [...previousState.files, {"id":key, "value":"", "language":"plaintext"}],
			file:{"id":key, "value":"", "language":"plaintext"},
			newFileCount: previousState.newFileCount + 1,
			show: 'main'
		}));
		window.api.send('tree-init', {"project":self.state.project});
	}
	
	closeFile(key:any) { 
	
		var files = this.getOpenFiles();
		if(files.length == 1) {
			window.api.send('controls', {"type":"close"});	
		}
	
		var id = key;
		if(!id) {
			id = this.state.file.id;
		}
		
		var node = document.querySelector('div[data-tab-id="'+id+'"]');
		if(node) {
			node.remove();
			var arr = this.state.files.filter(function(obj:any) {
				return obj.id !== id;
			});
			var item = arr[0];
			this.setState({files: arr, file:{"id":item.id, "value":item.value, "language":item.language}});
		}		
	}
	
	closeAllFiles() { 
		var files = this.getOpenFiles();
		this.setState({files: [], file:{}});
		for (let i = 0; i < files.length; i++) {
			var file = files[i];
			var node = document.querySelector('div[data-tab-id="'+file+'"]');
			if(node) {
				node.remove();
			}				
		}
		window.api.send('controls', {"type":"close"});
	}

	saveFile() { 
		var obj = this.state.file;
		if('id' in obj) {
			obj["value"] = this.editorRef.current.getValue();
			window.api.send('savefile', this.state.file);
		}
	}	

	onActiveTabChangeEvt(e:any) {
	
		var id = e.detail.tabEl.getAttribute('data-tab-id');
		var file = this.state.files.find((x:any) => x.id === id);
		if(file) {
			this.setState({"file":file});
		}
	}
	
	onTabAddEvt(e:any) {
		window.console.info(e.detail.tabEl);
	}
	
	onTabRemoveEvt(e:any) {
		window.console.info(e.detail.tabEl);
		var id = e.detail.tabEl.getAttribute('data-tab-id');
		this.closeFile(id);
	}
	
	onChangeEvt(value:any) {
		var project = this.state.projects.find((x:any) => x.id === value);
		if(project) {
			this.setState({"project":project});
		}
	}
	
	isUUID(uuid:any) {
		let s:any = "" + uuid;
		s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
		if (s === null) {
		  return false;
		}
		return true;
	}	
	
	onMenuClick(obj:any) {
	
		var self = this;

		if(obj.value == 'new-project') {
			self.setState({"show":'new-project'});
		} else if(obj.value == 'open') {
			var eventId = uuidv4();
			window.api.send('openfile', {"eventId":eventId});		
			window.api.on('openfile-data', (event: any, args: any) => {
				if(eventId == args.eventId) {
					
					var key = args.key + "?id=OPEN&type=local";
				
					var check = document.querySelector('div[data-tab-id="'+key+'"]');
					if(!check) {
						window.TabsIpc.addTab(key, args.name, args.icon);
						self.setState((previousState:any) => ({
							files: [...previousState.files, {"id":key, "value":args.value, "language":args.language}],
							file:{"id":key, "value":args.value, "language":args.language}
						}));				
					} else {
						var file = this.state.files.find((x:any) => x.id === key);
						if(file) {
							this.setState({"file":file});
						}			
						window.TabsIpc.setCurrentTab(check);
					}
				}
			});			
		} else if(obj.value == 'new') {
			self.newFile();
		} else if(obj.value == 'close') {
			self.closeFile(null);
		} else if(obj.value == 'close-all') {
			self.closeAllFiles();
		} else if(obj.value == 'save') {
			self.saveFile();
		} else if(obj.value == 'minimize') {
			window.api.send('controls', {"type":"minimize"});
		} else if(obj.value == 'maximize') {
			window.api.send('controls', {"type":"maximize"});
		} else if(obj.value == 'close-app') {
			window.api.send('controls', {"type":"close"});
		} else if(obj.value == 'settings') {
			this.setState({"show":"settings"});
		} else if(obj.value == 'exit') {
			window.api.send('controls', {"type":"close"});
		} else if(obj.value == 'undo') {
			this.editorRef.current.trigger("myapp", "undo");
		} else if(obj.value == 'redo') {
			this.editorRef.current.trigger("myapp", "redo");
		} else if(obj.value == 'copy') {
			this.editorRef.current.trigger('myapp', 'editor.action.clipboardCopyAction');
		} else if(obj.value == 'cut') {
			var editor = this.editorRef.current;
			editor.focus();
			document.execCommand('cut');
		} else if(obj.value == 'paste') {
			var editor = this.editorRef.current;
			editor.focus();
			navigator.clipboard.readText().then((text) => {
				// Replace the current contents with the text from the clipboard.
				editor.executeEdits("clipboard", [{
					range: editor.getSelection(),
					text: text,
					forceMoveMarkers: true,
				}]);        
			});		
			//this.paste(this.editorRef.current);
		} else if(obj.value == 'zoom') {
			this.setState({"show":"settings"});
		} else if(obj.value == 'word-wrap') {
			this.setState({"show":"settings"});
		} else if(obj.value == 'account') {
			$(".account-view").css({"visibility":"visible"});
		} else if(this.isUUID(obj.value) == true) {
			var project = this.state.projects.find((x:any) => x.id === obj.value);
			if(project) {
				self.setState({"show":"main", "project":project});
				window.api.send('tree-init', {"project":project});
			}	
		} 
		
		
		
		
	}
	
	onProjectCancelEvt(evt:any) {
		this.setState({"project":this.state.project, "show":"main"});
		window.api.send('tree-init', {"project":this.state.project});
	}
	
	onSubmitEvt(formData:any) {
		
		var self = this;
		window.api.send('config-update', {"project":formData});
		window.api.on('config-update-data', (event: any, args: any) => {

			var project = args.projects.find((x:any) => x.id === formData.id);
			if(project) {
				self.setState({"show":"main", "projects":args.projects, "project":project});
				window.api.send('tree-init', {"project":project});
			}			
		});
	}
	
	onFileReadEvt(node:any) {
		var self = this;
	
		if(node.folder === undefined) { 
		
			var key = node.key + "?type=" + self.state.project.type + "&id=" + self.state.project.id;
		
			var check = document.querySelector('div[data-tab-id="'+key+'"]');
			if(!check) {
				window.TabsIpc.addTab(key, node.title, node.icon);
				window.api.send("readfile", {"project":self.state.project, "path":node.key});				
			} else {
				var file = this.state.files.find((x:any) => x.id === node.data.id);
				if(file) {
					this.setState({"file":file});
				}			
				window.TabsIpc.setCurrentTab(check);
			}
		}
	}
	
	onUploadEvt(obj:any) {
		var self = this;
		obj["project"] = self.state.project;
		window.api.send('upload', obj);
	}
	
	loadStyle(event:any) {
	
	}	
	
	onCtxClick(event:any) {
	
		var node = this.state.contextMenuNode;
		if(node) {
			if(event.value == "refresh") {
			
				var dirPath = node.key.split("/").slice(0,-1).join("/");
				if(dirPath == '') {
					window.api.send('tree-init', {"project":this.state.project});
				} else {
					if(node.folder == true) {
						node.resetLazy();
						node.load(false);
						node.setExpanded(true);				
					} else {
						var dir = node.key.split("/").slice(0,-1).join("/");
						var tree = $("#tree").fancytree("getTree");
						var node = tree.getNodeByKey(dir);
						node.resetLazy();
						node.load(false);
						node.setExpanded(true);					
					}
				}
			} else if(event.value == "rename") {
				node.editStart();
			} else if(event.value == "new-file") {
			
				if(node.folder == true) {
					node.editCreateNode("child", {key: node.key+"/New File", title: "New File", "icon":"images/ext/txt.png"});
				} else {
					node.editCreateNode("after", {key: node.key+"/New File", title: "New File", "icon":"images/ext/txt.png"});
				}		

			} else if(event.value == "new-folder") {
			
				if(node.folder == true) {
					node.editCreateNode("child", {key: node.key+"/New Folder", title: "New Folder", folder: true, "icon":"images/folder.png"});
				} else {
					node.editCreateNode("after", {key: node.key+"/New Folder", title: "New Folder", folder: true, "icon":"images/folder.png"});
				}			

			} else if(event.value == "delete") {
				window.api.send('tree-node', {"type":"delete", "project":this.state.project, folder: node.folder, "path":node.key});
			}
		}	
	}
	
	onCtxValue(node:any) {
		this.setState({"contextMenuNode": node});
	}
	
	onRenameEvt(obj:any) {
		obj["project"] = this.state.project;
		window.api.send('tree-node', obj);
	}	
	
	onOpenEvt(event:any) {
		
		var project = this.state.projects.find((x:any) => x.id === event.id);
		if(project) {
			this.setState({"project":project, "show":"main"});
			window.api.send('tree-init', {"project":project});
		}
	}
	
	onChangeThemeEvt(isTheme:any) {
		this.setState({"theme":isTheme});
	}	
	
	onWordWrapEvt(isWordWrap:any) {
		this.setState({"WordWrap":isWordWrap});
	}
	
	onDeleteEvt(event:any) {
		window.api.send('project-delete', event);
	}	
	
	onUploadInfoEvt(event:any) {
		if(event.status == 'done') {
			this.setState({"uploading":false, "uploadingCount":0});
		} else if(event.status == 'length') {
			this.setState({"uploading":true, "uploadingSize":event.value, "uploadInfo":{"type":event.project.type, "name":event.project.name}});
		} else if(event.status == 'file-start') {
			this.setState((prevState, props) => ({
				uploadingCount: prevState.uploadingCount + 1
			}));
		} else if(event.status == 'file-done') {
			
		}
	}
	
    render(): JSX.Element {
	
		var self = this;
	
        return (
            <div className="edge-content" >
			
				{(() => {
					if (this.state.theme == true) {
						
						return (
							<Helmet>
								<link rel="stylesheet" href="images/theme/theme.css" />
							</Helmet>
						);									
					}
				})()}			
			
				
				<MainMenu onClick={this.onMenuClick} projects={this.state.projects} />
				<webview useragent="Galaxy Text Editor" className="account-view" src="https://app.netangular.com/login" partition="persist:galaxy" preload="js/auth.js" ></webview>
				
				{(() => {
					if (this.state.show == 'main') {
					  return (
						<div className="edge-editor" >
							<div id="contextMenuContainer">                         
								<ul id="contextMenu">    

									<li className="context-item" onClick={function(e:any) { self.onCtxClick({'value':'refresh'}); }} >Refresh</li>
									<li className="context-item" onClick={function(e:any) { self.onCtxClick({'value':'rename'}); }} >Rename</li>

									{(() => {
										if (this.state.project.type == 'bitbucket') {
										
										} else {
											return (
												<li className="context-item" onClick={function(e:any) { self.onCtxClick({'value':'delete'}); }} >Delete</li>
											);
										}
									})()}
									
									<li className="context-item" onClick={function(e:any) { self.onCtxClick({'value':'new-file'}); }} >New File</li>
									<li className="context-item" onClick={function(e:any) { self.onCtxClick({'value':'new-folder'}); }} >New Folder</li>
					
								</ul>
							</div>
							<SplitPane split="vertical" minSize={200} defaultSize={200} maxSize={400}>
								<div className="edge-content-l" >
									<div className="project-list-v" >
										<ProjectManager project={this.state.project} projects={this.state.projects} onChange={this.onChangeEvt} />
									</div>
									<div className="tree-content-v" >
										<FileTree onRename={this.onRenameEvt} onContext={this.onCtxValue} onUploadInfo={this.onUploadInfoEvt} onUpload={this.onUploadEvt} onFileRead={this.onFileReadEvt} project={this.state.project} />
										<div className="presentation-s2" >
											<div className="presentation-s3" ></div>
										</div>
									</div>
								</div>
								<div className="edge-content-r" >
								
									<Tabs onActiveTabChange={this.onActiveTabChangeEvt} onTabAdd={this.onTabAddEvt} onTabRemove={this.onTabRemoveEvt} ></Tabs>
									
									<div className="edge-edit" >
										<Editor
											onMount={this.onEditorDidMount}
											onChange={this.onEditorChange}
											path={this.state.file.id}
											defaultLanguage={this.state.file.language}
											defaultValue={this.state.file.value}
											options={{
												automaticLayout: true, // the important part
												readOnly: false,
												minimap: {
													enabled: false
												},
												overviewRulerBorder: false,
												overviewRulerLanes: 0,
												hideCursorInOverviewRuler: true,
												scrollbar: {
													verticalScrollbarSize: 10,
													horizontalScrollbarSize: 10
												},
												lineNumbers: function(lineNumber){
													return '<span style="margin-right:20px">'+lineNumber+'</span>';
												},
												glyphMargin: true,
												folding: false,
												lineDecorationsWidth: 10,
												lineNumbersMinChars: 0
											}}
										  />
										  
										{(() => {
											if (self.state.uploading == true) {
												return (
													<div className="upload-menu" >
														<div className="upload-menu-title" >
															<div className="upload-menu-img" >
																<img  className="upload-menu-im" src={"images/project/"+self.state.uploadInfo.type+".png"} />
															</div>
															<div className="upload-menu-text">{self.state.uploadInfo.name}</div>
														</div>
														<div className="upload-menu-r" >
															<div className="loading">Uploading</div>
															<div className="loading-of">{self.state.uploadingCount+" of "+self.state.uploadingSize+" files"}</div>
														</div>
													</div>
												);
											}
										})()}
									</div>
								</div>
							</SplitPane>
						</div>
					  )
					} else if (this.state.show == 'new-project') {
					  return (
						<div className="project-new-v1" >
							<div className="project-new-c1" >
								<ProjectCreate onSubmit={this.onSubmitEvt} onProjectCancel={this.onProjectCancelEvt}/>
							</div>
						</div>
					  )
					} else if (this.state.show == 'settings') {
					  return (
						<Settings projects={this.state.projects} theme={this.state.theme} wordWrap={this.state.wordWrap} onWordWrap={this.onWordWrapEvt} onChangeTheme={this.onChangeThemeEvt} onOpen={this.onOpenEvt} onDelete={this.onDeleteEvt}  />
					  )
					}
				})()}
            </div>
        );
    }
}