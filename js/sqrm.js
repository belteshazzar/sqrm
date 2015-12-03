/**
 * Copyright (c) 2015, Daniel Walton (daniel@belteshazzar.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var sqrm = {};

(function(){
	// PRIVATE VARIABLES //////////////////////////////////////////////

	// PRIVATE FUNCTIONS //////////////////////////////////////////////
	
	/*
	 * Create a random identifier for naming elements uniquely.
	 */
	function randomUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = crypto.getRandomValues(new Uint8Array(1))[0]%16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}

	function render(src) {

		function IL(indenting,text) {
			this.indenting = indenting;
			this.text = text;
		}

		var out = "";
		var linePos = 0;
		var line = null;
		var lineIndent = null;
		var next = null;
		var nextIndent = null;
		var divId = "";
		var divClass = "";
		var formNumber = 0;

		function process(indenting) {
			var ch;
			if (indenting==undefined) indenting = 0;

			while (line != null && (line.match(/^\s*$/) || (!line.match(/^\s*$/) && lineIndent >= indenting))) {
				if (line.match(/^\s*$/)) {
					nextLine();
				} else if (line.length > 0) {
					// special case for html comments
					if (line.match(/^<!--/)) {
						out += "<P>" + format(line) + "</P>";
						nextLine();
					} else {
						ch = line.charAt(0);
						switch (ch) {
							case '#':
								processTag();
								break;
							case '=':
								processHeading();
								break;
							case '*':
								processList();
								break;
							case '|':
								processTable();
								break;
							case '<':
								processDiv(indenting);
								break;
							default:
								out += "<P>" + format(line) + "</P>";
								nextLine();
						}
					}
				} else {
					nextLine();
				}
			}
		}

		function processDiv(indenting) {
			var divs = line.substring(1).trim().split(/\s+/, 2);
			var divId = divs[0].trim();
			var divClass = (divs.length == 2 ? " CLASS=\"" + divs[1] + "\"" : "");
			var element = divId.match(/(a)|(abbr)|(address)|(area)|(article)|(aside)|(base)|(bdi)|(bdo)|(blockquote)|(body)|(br)|(button)|(canvas)|(caption)|(cite)|(code)|(col)|(colgroup)|(datalist)|(dd)|(del)|(details)|(dfn)|(dialog)|(div)|(dl)|(dt)|(em)|(embed)|(fieldset)|(figcaption)|(figure)|(footer)|(form)|(h[1-6])|(head)|(header)|(hgroup)|(hr)|(html)|(i)|(iframe)|(img)|(input)|(ins)|(kbd)|(keygen)|(label)|(legend)|(li)|(link)|(main)|(map)|(mark)|(menu)|(menuitem)|(meta)|(meter)|(nav)|(noscript)|(object)|(ol)|(optgroup)|(option)|(output)|(p)|(param)|(pre)|(progress)|(q)|(rp)|(rt)|(ruby)|(s)|(samp)|(section)|(select)|(small)|(source)|(span)|(strong)|(style)|(sub)|(summary)|(sup)|(table)|(tbody)|(td)|(textarea)|(tfoot)|(th)|(thead)|(time)|(title)|(tr)|(track)|(u)|(ul)|(var)|(video)|(wbr)/i);
			if (divId=="code") out += "<code>";
			else out += "<DIV ID=\"" + divId + "\"" + divClass + ">";
			nextLine();
			process(indenting+1);
			if (divId=="code") out += "</code>";
			else out += "</DIV>";
		}

		function processList() {
			processList(1);
		}

		function processList(lvl) {
			if (!lvl) lvl = 0;
			var indenting = lineIndent;
			var inli = false;
			out += "<OL>";

			while (line != null
					&& line.length > 0
					&& line.charAt(0) == '*'
					&& lineIndent == indenting) {
				var starCount = 0;
				while (starCount < line.length && line.charAt(starCount) == '*') starCount++;
				if (starCount > lvl) {
					processList(lvl + 1);
					if (inli) {
						out += "</LI>";
						inli = false;
					}
				} else if (starCount < lvl) {
					break;
				} else {
					if (inli) out += "</LI>";
					out += "<LI>" + format(line.substring(lvl).trim());
					inli = true;
					nextLine();
				}
			}
			if (inli) out += "</LI>";
			out += "</OL>";
		}

		function processTable() {
			var indenting = lineIndent;
			var rows = [];
			var id = randomUUID().replace(/-/g, '_');

			while (line != null
					&& line.length > 0
					&& line.charAt(0) == '|'
					&& lineIndent == indenting) {
				rows.push(line.substring(1).split("|"));
				nextLine();
			}

			out += "<FORM id=\"form" + formNumber + "\" onsubmit=\"if (cm"
					+ id + ") cm" + id + ".save(); sqrm.submitForm('form"
					+ formNumber + "'); return false;\" >";
			out += "<TABLE>";
			for (var rowIndex=0 ; rowIndex<rows.length ; rowIndex++) {
				var cells = rows[rowIndex];
				out += "<TR>";
				if (cells.length > 0
						&& cells[0].length > 1
						&& cells[0].charAt(0) == '?') {
					var formType = cells[0].substring(1).trim().toLowerCase();
					var label = (cells.length > 1 ? format(cells[1]) : formType);
					var value = (cells.length > 2 ? cells[2].trim() : "");
					var placeholder = (cells.length > 3 ? cells[3].trim() : "");

					out += "<TD>";
					out += label;
					out += "</TD>";

					out += "<TD>";
					switch (formType) {
						case "title":
							if (!value.equals("")) {
								out += value;
								out += "<input type=\"hidden\" name=\"title\" value=\""
										+ value + "\" />";
							} else {
								out += "<input type=\"text\" name=\"title\" value=\"\" placeholder=\""
										+ placeholder + "\"/>";
							}
							break;
						case "revision":
							out += "<input type=\"hidden\" name=\"revision\" value=\""
									+ value + "\" />";
							break;
						case "body": // TODO: should only allow one body or one css
						case "css":
							out += "<textarea id=\"" + id + "\" name=\""
									+ formType + "\">";
							out += value.replaceAll("<BR>", "\n");
							out += "</textarea>";
							out += "<script>";
							out += "var cm"
									+ id
									+ " = CodeMirror.fromTextArea(document.getElementById(\""
									+ id
									+ "\"), {lineNumbers: true, mode: \"text/x-csrc\" });";
							out += "</script>";
							break;
						case "password":
							out += "<input type=\"password\" value=\"" + value
									+ "\"  placeholder=\"" + placeholder + "\"/>";
							break;
						case "submit":
							out += "<input type=\"submit\" value=\"" + value
									+ "\" />";
							break;
						case "reset":
							out += "<input type=\"reset\" value=\"" + value
									+ "\" />";
							break;
						case "note":
						default:
							out += "<input type=\"text\" name=\"" + formType
									+ "\" value=\"" + value + "\"  placeholder=\""
									+ placeholder + "\"/>";
							break;
					}
					out += "</TD>";
				} else {
					for (var cellIndex=0 ; cellIndex< cells.length ; cellIndex++) {
						var cell = cells[cellIndex];
						if (cell.length > 1 && cell.charAt(0) == '!')	{
							out += "<TH>" + format(cell.substring(1)) + "</TH>";
						} else {
							out += "<TD>" + format(cell) + "</TD>";
						}
					}
				}
				out += "\n";
				out += "</TR>\n";

			}
			out += "</TABLE>\n";
			out += "</FORM>\n";

			formNumber++;
		}

		function processTag() {
			var tag = line.substring(1).split(/\s+/,2);
			if (tag[0].charAt(0)!='!') {
				if (tag.length==2) {
					out += "<script>document."+tag[0]+" = \""+tag[1]+"\";</script>";
				} else {
					out += "<script>document."+tag[0]+" = true;</script>";
				}
			} else {
				tag[0] = tag[0].substring(1);
				out += "<script>"+tag[0]+"(";
				if (tag.length==2) {
					var params = tag[1].split("\\s+(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
					var cleanedParams = [];
					for (var i=0 ; i<params.length ; i++) {
						var param = params[i].trim();
						if (param.length>0) cleanedParams.push(param);
					}
					for (var i=0 ; i<cleanedParams.length-1 ; i++) {
						out += tagParam(cleanedParams.get(i))+",";
					}
					if (cleanedParams.size()>0) {
						out += tagParam(cleanedParams.get(cleanedParams.size()-1));
					}
				}
				out += ");</script>";
			}
			nextLine();
		}

		function processHeading() {
			var h = 1;
			while (h < line.length && line.charAt(h) == '=' ) h++;
			if (h>6) h=6;
			out += "<H" + h + ">" + format(line.substring(h).trim()) + "</H" + h + ">";
			nextLine();
		}

		function tagFor(c) {
			switch (c) {
				case '!':
					return "b>";
				case '~':
					return "i>";
				case '_':
					return "u>";
				case '-':
					return "del>";
				case '^':
					return "sup>";
				case '`':
					return "code>";
				default:
					return c + "";
			}
		}

		function link(s) {
			var parts = s.split("|", 2);
			if (parts.length == 1) return "<A HREF=\"" + url(parts[0]) + "\">" + parts[0] + "</A>";
			else return "<A HREF=\"" + url(parts[0]) + "\">" + parts[1] + "</A>";
		}

		function url(s) {
			return s;
		}

		function format(s) {
			return formatInternal(s,0,"","").str;
		}

		function escapeChar(c) {
			if (c=='<') {
				return "&lt;"
			} else if (c=='>') {
				return "&gt;";
			} else {
				return c;
			}
		}

		function formatInternal(s,i,out,inChar) {
			var a, b;

			while (i < s.length) {
				a = s.charAt(i++);
				if (a == '[') {
					for (var j = i; j < s.length; j++) {
						if (s.charAt(j) == ']')	{
							out += link(s.substring(i, j));
							i = j + 1;
							if (i >= s.length) {
								if (inChar != "") out += "</" + tagFor(inChar);
								return { i : i, str: out };
							}
							a = s.charAt(i++);
							break;
						}
					}
				}
				if (i + 1 > s.length) {
					out += escapeChar(a);
					if (inChar != "") out += "</" + tagFor(inChar);
					return { i : i, str: out };
				}
				b = s.charAt(i);
				if (a == b
						&& (a == '!' || a == '~' || a == '_' || a == '-'
								|| a == '^' || a == '`')) {
					i++;
					while (s.charAt(i)==a) {
						b = a;
						i++; // permissive with extra formatting tag chars
					}
					if (a == inChar) {
						out += "</" + tagFor(inChar);
						return { i : i, str: out };
					} else {
						out += "<" + tagFor(a);
						var f = formatInternal(s,i,out,a);
						i = f.i;
						out = f.str;
					}
				} else {
					out += escapeChar(a);
				}
			}
			if (inChar != "") out += "</" + tagFor(inChar);
			return { i : i, str: out };
		}

		function tagParam(s) {
			if ( s.charAt(0)=='"' && s.charAt(s.length-1)=='"') {
				return s;
			}
			if (isNan(s)) {
				return '"' + s + '"';
			} else {
				return s;
			}
		}

		function nextLine() {
			// if (nextIndent>lineIndent)
			// {
			// line = "";
			// lineIndent = nextIndent;
			// }
			// else if (nextIndent<lineIndent)
			// {
			// line = "";
			// lineIndent = nextIndent;
			// }
			// else
			// {
			line = next;
			lineIndent = nextIndent;

			if (next != null) {
				var n = readLine(lineIndent);
				next = n.text;
				nextIndent = n.indenting;
			}
			// }
		}

		function readNextLine() {
			if (linePos==src.length) return null;
			var from = linePos;
			while (linePos<src.length) {
				if (src.charAt(linePos)!="\n") {
					linePos++;
				} else {
					linePos++;
					return src.substring(from,linePos-1);
				}
			}
			return src.substring(from,linePos);
		}

		function readLine(defaultIndenting) {
			var line = null;

			while (true) {
				line = readNextLine();
				if (line == null) {
					return split(line, defaultIndenting);
				}

				while (line.length > 0
						&& line.charAt(line.length - 1) == '\\') {
					var nextLine = readNextLine();
					if (nextLine == null) {
						line = line.substring(0, line.length - 1);
						return split(line, defaultIndenting);
					}
					line = line.substring(0, line.length - 1) + nextLine;
				}

				if (line.match(/^\\s*$/)) {
					continue;
				}
				return split(line, defaultIndenting);
			}
		}

		function split(line, defaultIndenting) {
			if (line == null) {
				return new IL(0, null);
			} else if (line.length == 0) {
				return new IL(defaultIndenting, "");
			} else {
				var i = 0;
				while (i < line.length
						&& (line.charAt(i) == ' ' || line.charAt(i) == '\t')) {
					i++;
				}
				return new IL(i, line.substring(i));
			}
		}

		// init render
		var l = readLine(0);
		line = l.text;
		lineIndent = l.indenting;

		var n = readLine(0);
		next = n.text;
		nextIndent = n.indenting;
		process();
		return out;
	}
	
	// PUBLIC VARIABLES //////////////////////////////////////////////

	// PUBLIC FUNCTIONS //////////////////////////////////////////////

	// INITIALISATION ////////////////////////////////////////////////
	
	jQuery.ajaxSetup({
		converters: {
			"* sqrm" : render
		}
	});

	$("[sqrm]").each(function(i,el) {
		if ($(el).attr("sqrm")) {
			$.ajax({
				method: "GET",
				url : $(el).attr("sqrm"),
				dataType : "sqrm"
			}).done(function(data,status) {
				$(el).html(data);
			});
		} else {
			var contents = $(el).contents();
			var src = "";
			for (var i=0 ; i<contents.length ; i++) {
				if (contents[i].nodeType==3 || contents[i].nodeType==8) {
					src += contents[i].textContent;
				}
			}
			$(el).html(render(src));
		}
	});

}).call(sqrm);
