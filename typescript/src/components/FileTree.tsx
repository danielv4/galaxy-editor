/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/

import React, { Component } from "react";

// npm install jquery --save
// npm install --save @types/jquery

// npm install --save jquery.fancytree
// npm install --save @types/jquery.fancytree

// npm install --save-dev uuid
// npm install --save-dev @types/uuid



import { v4 as uuidv4 } from 'uuid';

const $ = require('jquery');
const fancytree = require('jquery.fancytree');
import 'jquery.fancytree/dist/modules/jquery.fancytree.dnd5';
import 'jquery.fancytree/dist/modules/jquery.fancytree.wide';
import 'jquery.fancytree/dist/modules/jquery.fancytree.edit';


import '../assets/css/skin-awesome.css'
import 'jquery.fancytree/dist/modules/jquery.fancytree.glyph';


// <FileTree onClick={this.onClickEvt} project={this.project} />




declare const window: any;

export class FileTree extends React.Component <any, any> {

	constructor(props: any) {
        super(props);
		
		// state
        this.state = { 
			"fileObjects": {},
		};
    }

	// before the component mounts, we initialise our state
	componentWillMount() {
	
	}

	// after the component did mount, we set the state each second.
	componentDidMount() {

		// readdir
		var self = this;
		window.api.on('readdir-data', (event: any, args: any) => {	
		
			var obj = self.state.fileObjects[args.path];
			if(obj) {
				if(obj.callback) {
					obj.callback.resolve(args.files);
				}
			}
		});
		
		// upload events
		window.api.on('upload-data', (event: any, args: any) => {	
			if(args.status == 'done') {
				if(args.key == '/') {
					window.api.send('tree-init', {"project":self.props.project});
				} else {
					var tree = $("#tree").fancytree("getTree");
					var node = tree.getNodeByKey(args.key);
					node.resetLazy();
					node.load(false);
					node.setExpanded(true);					
				}
				self.props.onUploadInfo(args);
			} else {
				self.props.onUploadInfo(args);
			}
		});
		

		var element;
		var doubleClicked = false;

		$(document).on("contextmenu", "#tree span.fancytree-title", function (e) {
			
			if(doubleClicked == false) {
			
				var path = $(e.target).closest("li[data-path]").attr("data-path");
				var tree = $("#tree").fancytree("getTree");
				var node = tree.getNodeByKey(path);
				self.props.onContext(node);
				
				
				element = $(e.target);
				element.css({"background":"#006eff14"});
				e.preventDefault();
			
				var windowHeight = $(window).height()/2;
				var windowWidth = $(window).width()/2;
				//When user click on bottom-left part of window
				if(e.clientY > windowHeight && e.clientX <= windowWidth) {
					$("#contextMenuContainer").css("left", e.clientX);
					$("#contextMenuContainer").css("bottom", $(window).height()-e.clientY);
					$("#contextMenuContainer").css("right", "auto");
					$("#contextMenuContainer").css("top", "auto");
				} else if(e.clientY > windowHeight && e.clientX > windowWidth) {
					//When user click on bottom-right part of window
					$("#contextMenuContainer").css("right", $(window).width()-e.clientX);
					$("#contextMenuContainer").css("bottom", $(window).height()-e.clientY);
					$("#contextMenuContainer").css("left", "auto");
					$("#contextMenuContainer").css("top", "auto");
				} else if(e.clientY <= windowHeight && e.clientX <= windowWidth) {
					//When user click on top-left part of window
					$("#contextMenuContainer").css("left", e.clientX);
					$("#contextMenuContainer").css("top", e.clientY);
					$("#contextMenuContainer").css("right", "auto");
					$("#contextMenuContainer").css("bottom", "auto");
				} else {
					//When user click on top-right part of window
					$("#contextMenuContainer").css("right", $(window).width()-e.clientX);
					$("#contextMenuContainer").css("top", e.clientY);
					$("#contextMenuContainer").css("left", "auto");
					$("#contextMenuContainer").css("bottom", "auto");
				}
				$("#contextMenuContainer").fadeIn(200, FocusContextOut());
				doubleClicked = true;
			} else {
				e.preventDefault();
				doubleClicked = false;
				$("#contextMenuContainer").fadeOut(200);
				element.css({"background":"none"});
			}
		});
		
		function FocusContextOut() {
			$(document).on("click", function () {
				doubleClicked = false; 
				$("#contextMenuContainer").fadeOut(200);
				$(document).off("click");
				element.css({"background":"none"});			  
			});
		}
		
		
		window.api.on('tree-init-data', (event:any, source:any, project:any) => {	
			
			

			var glyph_opts = {
				preset: "awesome5",
				map: {
					dragHelper: "fas fa-arrow-right",
					dropMarker: "fas fa-long-arrow-right",
					error: "fas fa-exclamation-triangle",
					expanderClosed: {"html":"<div class='tree-img' ><span class='arrow is-right'></span></div>"},
					expanderLazy: {"html":"<div class='tree-img' ><span class='arrow is-right'></span></div>"},
					expanderOpen: {"html":"<div class='tree-img' ><span class='arrow is-bottom'></span></div>"},
					loading: {"html":"<div class='tree-img' ><div class='load'></div></div>"},
					nodata: "far fa-meh",
					noExpander: "",
				}
			};
			

			$("#tree").remove();
			$("#tree-container").append('<div id="tree"></div>');			
			$('#tree').fancytree({
				extensions: ["dnd5", "wide", "edit", "glyph"],
				generateIds:true,
				wide: {
				},
				glyph: glyph_opts,
				source: source,
				selectMode: 1,
				lazyLoad: function(event: any, data: any) {
					window.console.info('(+) Deferred');
					var dfd = new $.Deferred();
					var node = data.node;
					data.result = dfd; 
					if(window.api) {
						window.api.send('readdir', {"path":node.key, "project":project, "dfd":"dfd"});
					}

					var obj = self.state.fileObjects;
					obj[node.key] = {"path":node.key, "callback":dfd, "files":[]}
					self.setState({"fileObjects":obj});
				},
				click: function(event:any, data:any) {

					var node = data.node;
					self.props.onFileRead(node);
				},
				dnd5: {
					dragStart: function(node:any, data:any) {
						return false;
					},
					dragEnter: function(node:any, data:any) {
						$(node.span).find(".fancytree-title").css({"background":"#0000000a"});
						return true;
					},
					dragLeave: function(node:any, data:any) {
						$(node.span).find(".fancytree-title").css({"background":"none"});
						return true;
					},
					dragDrop: function(node:any, data:any) {
						$(node.span).find(".fancytree-title").css({"background":"none"});
						self.getDroppedOrSelectedFiles(data).then(files => {
							self.props.onUpload({"path":node.key, "folder":node.folder, "files":files});
						});							
					}
				},
				renderNode: function(event:any, data:any) {
					var node = data.node;
					$(node.li).attr("data-path", node.key);
				},
				edit: {
					save: function(event, data) {
	
						var key = data.node.key;
						self.props.onRename({"type":"rename", "path":key, "folder":data.node.folder, "icon":data.node.icon, "name":data.input.val()});
						return true;
					}
				}
			});
		});		
		
	}
	
	
	traverseDirectory(entry:any) {
		var self = this;
		const reader = entry.createReader();
		return new Promise((resolveDirectory) => {
			const iterationAttempts = [];
			const errorHandler = () => {};

			function readEntries() {
				reader.readEntries((batchEntries) => {
					if (!batchEntries.length) {
						resolveDirectory(Promise.all(iterationAttempts))
					} else {
						iterationAttempts.push(Promise.all(batchEntries.map((batchEntry) => {
							if (batchEntry.isDirectory) {
								return self.traverseDirectory(batchEntry);
							}
							return Promise.resolve(batchEntry);
						})));

						readEntries();
					}
				}, errorHandler);
			}

			readEntries();
		});
	}

	packageFile(file:any, entry:any) {
		var object =  {
			//fileObject: file,
			fullPath: entry ? entry.fullPath : '',
			lastModified: file.lastModified,
			lastModifiedDate: file.lastModifiedDate,
			name: file.name,
			size: file.size,
			type: file.type,
			webkitRelativePath: file.webkitRelativePath 
		}
		return object;
	}

	getFile(entry:any) {
		var self = this;
		return new Promise((resolve) => {
			entry.file((file) => {
				var p = self.packageFile(file, entry);
				var fp = new FileReader();
				fp.onload = function (e) {
					p["buffer"] = fp.result;
					resolve(p);
				};
				fp.onerror = function(err) {

				};
				fp.readAsArrayBuffer(file);
			})
		})	
		
	}

	handleFilePromises(promises:any, fileList:any) {
		return Promise.all(promises).then((files) => {
			files.forEach((file) => {
				fileList.push(file);
			});
			return fileList;
		})
	}

	getDataTransferFiles(dataTransfer) {
		var self = this;
		const dataTransferFiles = [];
		const folderPromises = [];
		const filePromises = [];

		[].slice.call(dataTransfer.items).forEach((listItem) => {
			if (typeof listItem.webkitGetAsEntry === 'function') {
				const entry = listItem.webkitGetAsEntry();

				if (entry) {
					if (entry.isDirectory) {
						folderPromises.push(self.traverseDirectory(entry));
					} else {
						filePromises.push(self.getFile(entry));
					}
				} else {
					dataTransferFiles.push(listItem);
				}
			}
		});
		if (folderPromises.length) {
			const flatten = (array) => array.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
			return Promise.all(folderPromises).then((fileEntries) => {
				const flattenedEntries = flatten(fileEntries);
				flattenedEntries.forEach((fileEntry) => {
					filePromises.push(self.getFile(fileEntry));
				});
				return self.handleFilePromises(filePromises, dataTransferFiles);
			});
		} else if (filePromises.length) {
			return self.handleFilePromises(filePromises, dataTransferFiles);
		}

		return Promise.resolve(dataTransferFiles);
	} 

	// Use this function by passing the drop or change event.
	getDroppedOrSelectedFiles(event) {
		var self = this;
		const dataTransfer = event.dataTransfer;
		if (dataTransfer && dataTransfer.items) {
			return self.getDataTransferFiles(dataTransfer)
				.then((fileList) => {
					return Promise.resolve(fileList);
				})
		}

		const files = [];
		const dragDropFileList = dataTransfer && dataTransfer.files;
		const inputFieldFileList = event.target && event.target.files;
		const fileList = dragDropFileList || inputFieldFileList || [];

		for (let i = 0; i < fileList.length; i++) {
			files.push(self.packageFile(fileList[i], null));
		}

		return Promise.resolve(files);
	}	
	
	
	componentWillReceiveProps(nextProps:any) {

		var self = this;
				
		// only update when project is selected
		if(nextProps.project !== self.props.project) {
			window.console.info('(+) fancytree loaded');
			if(window.api) {		
				window.api.send('tree-init', {"project":nextProps.project});
			}	
		}
	}	
	
	componentDidUpdate() {
		
	}

    render(): JSX.Element {
        return (
            <div id="tree-container">	
				<div id="tree" ></div>
            </div>
        );
    }
}