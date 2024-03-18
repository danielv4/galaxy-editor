/* 
	Copyright 2022 NetAngular Technologies Inc. 
	All rights reserved.
	Author: Daniel Vanderloo <daniel@netangular.com>
*/


const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const upath = require('upath');
let Client = require('ssh2-sftp-client');
const axios = require('axios').default;
var querystring = require("querystring");
var FormData = require('form-data');
var fetch = require('node-fetch');



class FileSystem {

	constructor(config) {
		
		// local
		// sftp
		// bitbucket
		// github
		// gitlab		


		this.config = config;
		this.basePath = "images/ext/";

		if(this.config.type == 'sftp') {
		
			this.client = new Client();
		}
    }
	
	resolve(path_t) { 

		var list = [
		  "bat",
		  "blend",
		  "cc",
		  "coffee",
		  "conf",
		  "cpp",
		  "cs",
		  "dart",
		  "Dockerfile",
		  "ex",
		  "exs",
		  "gif",
		  "gltf",
		  "go",
		  "gradle",
		  "gz",
		  "html",
		  "ico",
		  "ini",
		  "jar",
		  "java",
		  "jpeg",
		  "jpg",
		  "js",
		  "json",
		  "kt",
		  "lua",
		  "mjs",
		  "none",
		  "pdf",
		  "php",
		  "pl",
		  "png",
		  "psql",
		  "py",
		  "rb",
		  "rlib",
		  "rs",
		  "scala",
		  "sh",
		  "sql",
		  "swift",
		  "tar.gz",
		  "tar",
		  "ts",
		  "txt",
		  "xml",
		  "yml",
		  "zip"
		];

		var filename = path.basename(path_t);
		var ext = path.extname(filename).replace('.', '');
		
		if(filename == 'Dockerfile') {
			return this.basePath + filename + '.png';
		} else if (list.includes(ext)) {
			return this.basePath + ext + '.png';
		} else {
			return this.basePath + "none.png";
		}
	}
	
	path2Lang(fpath) { 

		var ext = path.extname(fpath).replace('.', '');
		var languages = {
			'abap': 'abap',
			'aes': 'aes',
			'cls': 'apex',
			'azcli': 'azcli',
			'bat': 'bat',
			'bicep': 'bicep',
			'c': 'c',
			'clj': 'clojure',
			'coffee': 'coffeescript',
			'cpp': 'cpp',
			'cc': 'cpp',
			'cs': 'csharp',
			'csp ': 'csp',
			'css': 'css',
			'dart': 'dart',
			'ecl': 'ecl',
			'ex': 'elixir',
			'fs': 'fsharp',
			'go': 'go',
			'gql': 'graphql',
			'hcl': 'hcl',
			'html': 'html',
			'ini': 'ini',
			'java': 'java',
			'js': 'javascript',
			'json': 'json',
			'jl': 'julia',
			'kt': 'kotlin',
			'less': 'less',
			'liquid': 'liquid',
			'lua': 'lua',
			'm3': 'm3',
			'md': 'markdown',
			'msdax': 'msdax',
			'm': 'objective-c',
			'pas': 'pascal',
			'pl': 'perl',
			'php': 'php',
			'txt': 'plaintext',
			'mez': 'powerquery',
			'ps1': 'powershell',
			'pug': 'pug',
			'py': 'python',
			'r': 'r',
			'cshtml': 'razor',
			'rst': 'restructuredtext',
			'rb': 'ruby',
			'rs': 'rust',
			'sb': 'sb',
			'scala': 'scala',
			'scm': 'scheme',
			'scss': 'scss',
			'sh': 'shell',
			'sol': 'sol',
			'sql': 'sql',
			'st': 'st',
			'swift': 'swift',
			'tcl': 'tcl',
			'twig': 'twig',
			'ts': 'typescript',
			'vb': 'vb',
			'verilog': 'verilog',
			'xml': 'xml',
			'yaml': 'yaml',
			'h': 'c'
		}
		return languages[ext];
	}

	readdir(dir, callback) {
		var self = this;
		if(this.config.type == 'local') {
			fs.readdir(dir, { withFileTypes: true }, (err, files) => {
				callback(files.map(function(file) {
					
					var newPath = path.normalize(dir + '/' + file.name);
					newPath = upath.toUnix(newPath);				
					
					if(file.isDirectory()) {
						return { "id":uuidv4(), "icon":"images/folder.png", "title":file.name, lazy: true, "folder":true, key: newPath, cache:false}
					} else {
						return { "id":uuidv4(), "language": self.path2Lang(newPath), "icon":self.resolve(newPath), "title":file.name, key: newPath}
					}
				}));
			});
		} else if(this.config.type == 'sftp') {
			
			if(self.client.sftp == null) {
				
				if(this.config.authentication_type == 'Private Key') {
				
					this.client.connect({
						host: this.config.host,
						port: this.config.port,
						username: this.config.username,
						privateKey: this.config.privateKey
					}).then(() => {
						self.client.list(dir).then(files => {
				
							callback(files.map(function(file) {
								
								var newPath = path.normalize(dir + '/' + file.name);
								newPath = upath.toUnix(newPath);				
								
								if(file.type == 'd') {
									return { "id":uuidv4(), "icon":"images/folder.png", "title":file.name, lazy: true, "folder":true, key: newPath, cache:false}
								} else {
									return { "id":uuidv4(), "language": self.path2Lang(newPath), "icon":self.resolve(newPath), "title":file.name, key: newPath}
								}
							}));
						});
					});	
				} else {
					
					this.client.connect({
						host: this.config.host,
						port: this.config.port,
						username: this.config.username,
						password: this.config.password
					}).then(() => {
						self.client.list(dir).then(files => {
				
							callback(files.map(function(file) {
								
								var newPath = path.normalize(dir + '/' + file.name);
								newPath = upath.toUnix(newPath);				
								
								if(file.type == 'd') {
									return { "id":uuidv4(), "icon":"images/folder.png", "title":file.name, lazy: true, "folder":true, key: newPath, cache:false}
								} else {
									return { "id":uuidv4(), "language": self.path2Lang(newPath), "icon":self.resolve(newPath), "title":file.name, key: newPath}
								}
							}));
						});
					});						
				}
			} else {
				self.client.list(dir).then(files => {
		
					callback(files.map(function(file) {
						
						var newPath = path.normalize(dir + '/' + file.name);
						newPath = upath.toUnix(newPath);				
						
						if(file.type == 'd') {
							return { "id":uuidv4(), "icon":"images/folder.png", "title":file.name, lazy: true, "folder":true, key: newPath, cache:false}
						} else {
							return { "id":uuidv4(), "language": self.path2Lang(newPath), "icon":self.resolve(newPath), "title":file.name, key: newPath}
						}
					}));
				});
			}		
		} else if(this.config.type == 'bitbucket') {
			var basicAuth = 'Basic ' + Buffer.from(self.config.key).toString('base64');
			axios({
				method: 'GET',
				url: 'https://api.bitbucket.org/2.0/repositories/'+self.config.username+'/'+self.config.repo+'/src/'+self.config.branch + dir +'/?pagelen=100',
				headers: {"Authorization": basicAuth, "Content-Type": "application/json"}
			}).then(function (r) {
				callback(r.data.values.map(function(file) {
					
					var filename = path.basename(file.path);
					var newPath = path.normalize(dir + '/' + filename);
					newPath = upath.toUnix(newPath);
					
					if(file.type == 'commit_directory') {
						return { "id":uuidv4(), "icon":"images/folder.png", "title":filename, lazy: true, "folder":true, key: newPath, cache:false}
					} else {
						return { "id":uuidv4(), "language": self.path2Lang(newPath), "icon":self.resolve(newPath), "title":filename, key: newPath}
					}
				}));
			});
		} else if(this.config.type == 'github') {
			axios({
				method: 'GET',
				url: 'https://api.github.com/repos/' + self.config.username + '/' + self.config.repo + '/contents' + dir + '?branch=' + self.config.branch,
				headers: {
					"Authorization":"token " + self.config.key, 
					"Accept": "application/vnd.github+json"
				}
			}).then(function (r) {

				callback(r.data.map(function(file) {
					
					var newPath = path.normalize(dir + '/' + file.name);
					newPath = upath.toUnix(newPath);				
					
					if(file.type == 'dir') {
						return { "id":uuidv4(), "icon":"images/folder.png", "title":file.name, lazy: true, "folder":true, key: newPath, cache:false}
					} else {
						return { "id":uuidv4(), "language": self.path2Lang(newPath), "icon":self.resolve(newPath), "title":file.name, key: newPath}
					}
				}));
			});
		} else if(this.config.type == 'gitlab') {
			
			if(this.config.is_group == false) {
			
				axios({
					method: 'GET',
					url: 'https://gitlab.com/api/v4/projects/' + querystring.escape(self.config.username + '/' + self.config.repo),
					headers: {
						"PRIVATE-TOKEN":self.config.key, 
						"Accept": "application/vnd.github+json"
					}
				}).then(function (res) {	
				
					var project_id = res.data.id;
					var newDir = dir.substring(1);
					var ls = 'https://gitlab.com/api/v4/projects/'+project_id+'/repository/tree?per_page=1000&ref'+self.config.branch+'&path='+newDir;
					axios({
						method: 'GET',
						url: ls,
						headers: {
							"PRIVATE-TOKEN":self.config.key, 
							"Accept": "application/vnd.github+json"
						}
					}).then(function (r) {
						callback(r.data.map(function(file) {
							
							var newPath = path.normalize(dir + '/' + file.name);
							newPath = upath.toUnix(newPath);				
							
							if(file.type == 'tree') {
								return { "id":uuidv4(), "icon":"images/folder.png", "title":file.name, lazy: true, "folder":true, key: newPath, cache:false}
							} else {
								return { "id":uuidv4(), "language": self.path2Lang(newPath), "icon":self.resolve(newPath), "title":file.name, key: newPath}
							}
						}));
					});			
				});
			} else {
				var newDir = dir.substring(1);
				var ls = 'https://gitlab.com/api/v4/projects/'+this.config.project_id+'/repository/tree?per_page=1000&ref'+self.config.branch+'&path='+newDir;
				axios({
					method: 'GET',
					url: ls,
					headers: {
						"PRIVATE-TOKEN":self.config.key, 
						"Accept": "application/vnd.github+json"
					}
				}).then(function (r) {
					callback(r.data.map(function(file) {

						var newPath = path.normalize(dir + '/' + file.name);
						newPath = upath.toUnix(newPath);				

						if(file.type == 'tree') {
							return { "id":uuidv4(), "icon":"images/folder.png", "title":file.name, lazy: true, "folder":true, key: newPath, cache:false}
						} else {
							return { "id":uuidv4(), "language": self.path2Lang(newPath), "icon":self.resolve(newPath), "title":file.name, key: newPath}
						}
					}));
				});				
			}
		}
	}
	
	readFile(filePath, callback) {
		var self = this;
		if(this.config.type == 'local') {
			fs.readFile(filePath, 'utf8', function(err, data) {
				if(err) {
					callback({"error":err});
				} else {
					callback({"name":path.basename(filePath), "value":data, "language":self.path2Lang(filePath), "error":err});
				}
			});	
		} else if(this.config.type == 'sftp') {
			var readStream = self.client.createReadStream(filePath);
			const chunks = [];
			readStream.on("data", function (chunk) {
				chunks.push(chunk);
			});
			readStream.on("end", function () {
				callback({"name":path.basename(filePath), "value":Buffer.concat(chunks).toString(), "language":self.path2Lang(filePath)});
			});	
			readStream.on("error", function (error) {
				callback({"error":error});
			});			
		} else if(this.config.type == 'bitbucket') {
			
			var basicAuth = 'Basic ' + Buffer.from(self.config.key).toString('base64');
			const url = new URL('https://api.bitbucket.org/2.0/repositories/'+self.config.username+'/'+self.config.repo+'/src/'+self.config.branch+filePath);
			const options = {
				method: 'get',
				headers: {
					"Authorization": basicAuth,
					"Content-Type": "application/json"
				}
			}
			fetch(url, options).then((response) => response.text()).then((data) => {
				callback({"name":path.basename(filePath), "value":data, "language":self.path2Lang(filePath), "error":null});
			}).catch((error) => {
				callback({"error":error});
			});
			
		} else if(this.config.type == 'github') {
			
			
			const url = new URL('https://api.github.com/repos/'+ self.config.username +'/'+ self.config.repo +'/contents' + filePath + '?branch=' + self.config.branch);
			const options = {
				method: 'get',
				headers: {
					"Authorization":"token " + self.config.key, 
					"Accept": "application/vnd.github+json"
				}
			}
			fetch(url, options).then((response) => response.json()).then((data) => {
				callback({"name":path.basename(filePath), "value":Buffer.from(data.content, 'base64').toString(), "language":self.path2Lang(filePath), "error":null});
			}).catch((error) => {
				callback({"error":error});
			});
			
		} else if(this.config.type == 'gitlab') {
			var newfilePath = filePath.substring(1);
			const url = new URL('https://gitlab.com/api/v4/projects/'+this.config.project_id+'/repository/files/'+querystring.escape(newfilePath)+'?ref='+self.config.branch);
			const options = {
				method: 'get',
				headers: {
					"PRIVATE-TOKEN":self.config.key, 
					"Accept": "application/vnd.github+json"
				}
			}
			fetch(url, options).then((response) => response.json()).then((data) => {
				callback({"name":path.basename(filePath), "value":Buffer.from(data.content, 'base64').toString(), "language":self.path2Lang(filePath), "error":null});
			}).catch((error) => {
				callback({"error":error});
			});
		}
	}
	
	
	writeFile(filePath, content, callback) {
		var self = this;
		if(this.config.type == 'local') {
			fs.promises.mkdir(path.dirname(filePath), { recursive: true }).then(() => {
				fs.writeFile(filePath, content, (err) => {
					if (err) {
						callback({"write":false, "err":err});
					} else {
						callback({"write":true, "err":null});
					}
				});
			});
		} else if(this.config.type == 'sftp') {
			 self.client.mkdir(path.dirname(filePath), true).then(() => {
				var stream = self.client.createWriteStream(filePath, { flags: 'w', encoding: "utf8", mode: parseInt('0644',8) });
				stream.write(content);
				stream.end();
				stream.on('close', () => {
					callback({"write":true, "err":null});
				});
				stream.on('error', function(err) {
					callback({"write":false, "err":err});
				});
			})
		} else if(this.config.type == 'bitbucket') {
			var basicAuth = 'Basic ' + Buffer.from(self.config.key).toString('base64');
			const url = new URL('https://api.bitbucket.org/2.0/repositories/'+self.config.username+'/'+self.config.repo+'/src/');
			const data = new URLSearchParams();
			//data.append('message', 'okkk');
			data.append('branch', self.config.branch);
			data.append(filePath, content);
			const options = {
				method: 'post',
				headers: {
					"Authorization": basicAuth,
					"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
				},
				body : data
			}
			fetch(url, options).then(res => {
				if(res.status == 201) {
					callback({"write":true, "err":null});
				} else {
					callback({"write":false, "err":res.error});
				}
            })
		} else if(this.config.type == 'github') {
			
			// create & update
			var parentDir = path.dirname(filePath);
			var filename = path.basename(filePath);
			axios({
				method: 'GET',
				url: 'https://api.github.com/repos/' + self.config.username + '/' + self.config.repo + '/contents' + parentDir + '?branch=' + self.config.branch,
				headers: {
					"Authorization":"token " + self.config.key, 
					"Accept": "application/vnd.github+json"
				}
			}).then(response => {
				return response.data
			}).then(data => {
				
				var obj = {
					"message": uuidv4(),
					"content": Buffer.from(content).toString('base64'),
					"branch": self.branch,
				};
				
				if(data) {
					var file = data.find(x => x.name === filename);
					if(file) {
						var sha = file.sha;
						obj["sha"] = sha;
					}
				}
				
				axios({
					url: 'https://api.github.com/repos/'+self.config.username+'/'+self.config.repo+'/contents'+filePath,
					method: "PUT",
					data: JSON.stringify(obj),
					headers: {
						"Authorization":"token " + self.config.key, 
						"Content-type": "application/json"
					}
				}).then(function(response) {
					callback({"write":true, "err":null});
				}).catch(error => {
					callback({"write":false, "err":error});
				});				
			}).catch(error => {

				var obj = {
					"message": uuidv4(),
					"content": Buffer.from(content).toString('base64'),
					"branch": self.branch,
				};
				
				axios({
					url: 'https://api.github.com/repos/'+self.config.username+'/'+self.config.repo+'/contents'+filePath,
					method: "PUT",
					data: JSON.stringify(obj),
					headers: {
						"Authorization":"token " + self.config.key, 
						"Content-type": "application/json"
					}
				}).then(function(response) {
					callback({"write":true, "err":null});
				}).catch(error => {
					callback({"write":false, "err":error});
				});
			});
		} else if(this.config.type == 'gitlab') {

			// create & update
			var parentDir = path.dirname(filePath);
			var filename = path.basename(filePath);	

			if(this.config.is_group == false) {
			
				axios({
					method: 'GET',
					url: 'https://gitlab.com/api/v4/projects/' + querystring.escape(self.config.username + '/' + self.config.repo),
					headers: {
						"PRIVATE-TOKEN":self.config.key, 
						"Accept": "application/vnd.github+json"
					}
				}).then(function (res) {	
				
					var project_id = res.data.id;
					var newDir = parentDir.substring(1);
					var ls = 'https://gitlab.com/api/v4/projects/'+project_id+'/repository/tree?per_page=1000&ref'+self.config.branch+'&path='+newDir;
					axios({
						method: 'GET',
						url: ls,
						headers: {
							"PRIVATE-TOKEN":self.config.key, 
							"Accept": "application/vnd.github+json"
						}
					}).then(function (r) {

						var method = 'post';
						var file = r.data.find(x => x.name === filename);
						if(file) {
							method = 'put';
						}	
						
						var newFilePath = filePath.substring(1);
						const url = new URL('https://gitlab.com/api/v4/projects/'+self.config.project_id+'/repository/files/'+querystring.escape(newFilePath));
						const options = {
							method: method,
							headers: {
								"PRIVATE-TOKEN": self.config.key,
								"Content-type": "application/json"
							},
							body : JSON.stringify({"branch": self.config.branch, "content": content, "commit_message": uuidv4()})
						}
						fetch(url, options).then(res => {
							if(res.status == 201 || res.status == 200) {
								callback({"write":true, "err":null});
							} else {
								callback({"write":false, "err":res.error});
							}
						});
					});			
				});
			} else {
				var newDir = parentDir.substring(1);
				var ls = 'https://gitlab.com/api/v4/projects/'+this.config.project_id+'/repository/tree?per_page=1000&ref'+self.config.branch+'&path='+newDir;
				axios({
					method: 'GET',
					url: ls,
					headers: {
						"PRIVATE-TOKEN":self.config.key, 
						"Accept": "application/vnd.github+json"
					}
				}).then(function (r) {
						var method = 'post';
						var file = r.data.find(x => x.name === filename);
						if(file) {
							method = 'put';
						}	
						
						var newFilePath = filePath.substring(1);
						const url = new URL('https://gitlab.com/api/v4/projects/'+self.config.project_id+'/repository/files/'+querystring.escape(newFilePath));
						const options = {
							method: method,
							headers: {
								"PRIVATE-TOKEN": self.config.key,
								"Content-type": "application/json"
							},
							body : JSON.stringify({"branch": self.config.branch, "content": content, "commit_message": uuidv4()})
						}
						fetch(url, options).then(res => {
							if(res.status == 201 || res.status == 200) {
								callback({"write":true, "err":null});
							} else {
								callback({"write":false, "err":res.error});
							}
						});
				});				
			}
		}	
	}
	
	
	deleteFile(filePath, callback) {
		var self = this;
		if(filePath) {
			if(this.config.type == 'local') {
				fs.unlink(filePath, function(err) {
					if(err) {
						callback({"delete":false, "error":err});
					}
					callback({"delete":true, "error":err});
				});
			} else if(this.config.type == 'sftp') {
				self.client.delete(filePath).then(() => {
					callback({"delete":true, "error":null});
				});
			} else if(this.config.type == 'bitbucket') {

			} else if(this.config.type == 'github') {
				
				// delete
				var parentDir = path.dirname(filePath);
				var filename = path.basename(filePath);
				axios({
					method: 'GET',
					url: 'https://api.github.com/repos/' + self.config.username + '/' + self.config.repo + '/contents' + parentDir + '?branch=' + self.config.branch,
					headers: {
						"Authorization":"token " + self.config.key, 
						"Accept": "application/vnd.github+json"
					}
				}).then(response => {
					return response.data
				}).then(data => {
				
					if(data) {
						var file = data.find(x => x.name === filename);
						if(file) {
							var sha = file.sha;
							axios({
								url: 'https://api.github.com/repos/'+self.config.username+'/'+self.config.repo+'/contents'+filePath+'?branch='+self.config.branch,
								method: "DELETE",
								data: JSON.stringify({"message":"delete", "sha":sha}),
								headers: {
									"Authorization":"token " + self.config.key,
								}
							}).then(function(response) {
								callback({"delete":true, "error":null});
							}).catch(error => {
								callback({"delete":false, "error":error});
							});
						}
					}
				}).catch(error => {

				});
			} else if(this.config.type == 'gitlab') {
				var newPath = filePath.substring(1);
				axios({
					url: 'https://gitlab.com/api/v4/projects/'+self.config.project_id+'/repository/files/'+querystring.escape(newPath),
					method: "DELETE",
					data: JSON.stringify({"branch":self.config.branch, "commit_message": uuidv4()}),
					headers: {
						"PRIVATE-TOKEN": self.config.key,
						"Content-type": "application/json"
					}
				}).then(function(response) {
					callback({"delete":true, "error":null});
				}).catch(error => {
					callback({"delete":false, "error":error});
				});
			}
		}
	}
	
	
	writeFilePromise(filePath, content, callback) {
		var self = this;
		return new Promise((resolve, reject) => {
			self.writeFile(filePath, content, function(result) {
				if(result.err) {
					reject(result.err);
				}
				resolve(result.write);
			});
		});
	}
	
	
	readFilePromise(filePath, callback) {
		var self = this;
		return new Promise((resolve, reject) => {
			self.readFile(filePath, function(result) {
				if(result.err) {
					reject(result.error);
				}
				resolve(result);
			});
		});
	}	
	
	
	deleteFilePromise(filePath, callback) {
		var self = this;
		return new Promise((resolve, reject) => {
			self.readFile(filePath, function(result) {
				
				if(result.error != null) {
					reject(result.error);
				}
				
				resolve(result);
			});
		});
	}


	async renameFile(name, filePath) {
		var self = this;
		var newFilePath = path.dirname(filePath) + name;

		let result = await self.readFilePromise(filePath);
		await self.deleteFilePromise(filePath); 
		await self.writeFilePromise(newFilePath, result.value); 
	}	
	
	
	async upload(project, win, dir, files) {
		var value;
		var self = this;
		win.webContents.send('upload-data', {"status":"length", "project":project, "value":files.length});
		for (let i = 0; i < files.length; i++) {
			var item = files[i];
			var content = Buffer.from(item.buffer);
			var filePath = item.fullPath;
			var dst = dir + filePath;
			dst = dst.replace(/\/+/g, "/")
			win.webContents.send('upload-data', {"status":"file-start", "path":dst});
			let result = await self.writeFilePromise(dst, content);
			win.webContents.send('upload-data', {"status":"file-done", "path":dst});
		}	
	}
}