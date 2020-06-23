'use strict';

(function(){

	class Observer {
  
	  constructor() {
	    this.events = [];
	  }
	  
	  attach(evt, l) {
	    if(typeof this.events.find(a => a.evt === evt) === 'undefined'){
	      this.events.push({
	        evt:evt,
	        listener:l
	      });
	    }
	  }
	  
	  notify(evt, arg) {
	    for(let e of this.events){
	      if(e['evt'] === evt) e['listener'](arg);
	    }
	  }

	  remove(evt){
	    const na = [];
	    for(let e of this.events){
	      if(e['evt'] !== evt) na.push(e);
	    }
	    this.events = na;
	  }

	  display(){
	    for(let e of this.events){
	      console.log(e);
	    }
	  }
	}

	class Queue{
		constructor(){
			this.queue = [];
		}

		kill(){
			this.queue = [];
		}

		register(name,fun,cat = ''){
			this.queue.push({
				name,fun,cat
			});
		}

		call(name,callback){
			this.queue.forEach(a => {
				if(a.name === name){
					if(typeof callback === 'undefined'){
						a.fun()
					}else{
						callback(a.fun());
					}
				}
			});
		}

		callByNameAndCategory(name,cat,callback){
			this.queue.forEach(a => {
				if(a.cat === cat && a.name === name){
					if(typeof callback === 'undefined'){
						a.fun()
					}else{
						callback(a.fun());
					}
				}
			});
		}

		callActionByCategory(cat,callback){
			this.queue.forEach(a => {
				if(a.cat === cat){
					if(typeof callback === 'undefined'){
						a.fun()
					}else{
						callback(a.fun());
					}
				}
			});
		}
	}

	const GLOBAL_QUEUE = new Queue();

	class Component extends Observer{
	  constructor(){
	    super();

	    this.APP = $('app');
	  }

	  render(){};

	  refresh(){
	    this.render();

	    this.addListeners();
	  }

	  listen(o){
	  	const group = [...this.APP.getElementsByClassName('group')];

	  	group.forEach(g => {
	  		const elements = [...g.getElementsByClassName(o.name)];

	  		elements.forEach(element => {
	  			element.addEventListener(o.event,() => this.notify(g.id,{element:element,event:o}))
	  		});
			});
		}

		getGroupById(id,callback){
	  	const group = [...this.APP.getElementsByClassName('group')];

	  	group.forEach(g => {
	  		const elements = [...g.getElementsByClassName('onclick')];
	  		if(id === g.id){
	  			callback(elements);
	  		}
	  	});
		}

		addListeners(){
			[{
				name:'onclick',
				event:'click'
			},{
	      name:'onmauseover',
	      event:'mouseover'
	    },{
	      name:'onkeyup',
	      event:'keyup'
	    }].forEach(l => {
				this.listen(l);
			});
		}
	}

	class StandardMenuComponent extends Component{

		constructor(){
			super();
		}

		render(){
			$('menu').innerHTML = `<a href="#default" class="logo">Mobile <span>CAM</span></a>
															<div id="menu-buttons" class="group">
													      <div class="features-box">
													        <div class="hamburger onclick" data-id="open-sidebar">
													          <div></div>
													          <div></div>
													          <div></div>
													        </div>
													      </div>
												      </div>`;
		}
	}

	class StandardMenuViewController{
		constructor(){
			this.UIcomponent = new StandardMenuComponent();

			this.UIcomponent.refresh();

			this.UIcomponent.attach('menu-buttons',o => {
				switch(o.event.name){
					/* clicked */
					case 'onclick':
						
						if(typeof o.element.dataset.id !== 'undefined'){
							switch(o.element.dataset.id){
								case 'open-sidebar':

									console.log('sidebar opened')

									GLOBAL_QUEUE.call('sidebar',o => {
										o.UIcomponent.show();
									})

									GLOBAL_QUEUE.call('overlay',o => {
										o.UIcomponent.show();
									})

								break;
							}
						}
						
					break;
				}
			});

		}
	}

	GLOBAL_QUEUE.register('standard-menu',() => new StandardMenuViewController(),'menu');

	class WarningMessageComponent extends Component{

		constructor(){
			super();

			this.uiID = $('modal-box');
		}

		render(){
			this.uiID.innerHTML = `<div class="content">
															<label>Message modal box !</label>
														</div>
														<div class="group" id="overlay-buttons">
															<button class="onclick" data-id="cancel" style="border-right:1px solid gray;">Cancel</button>
															<button class="onclick" data-id="ok">Ok</button>
														</div>`;
		}

		show(){
			this.uiID.classList.remove('hide');
		}

		hide(){
			this.uiID.classList.add('hide');
		}
	}

	class WarningMessageViewController{
		constructor(){
			this.UIcomponent = new WarningMessageComponent();

			this.UIcomponent.refresh();

			this.UIcomponent.attach('overlay-buttons',o => {
				switch(o.event.name){
					/* clicked */
					case 'onclick':

						switch(o.element.dataset.id){

							case 'cancel':
								
								GLOBAL_QUEUE.call('modal-overlay',o => {
									o.UIcomponent.hide();
								})

								this.UIcomponent.hide();

							break;
						}
						
					break;
				}
			});
		}
	}

	GLOBAL_QUEUE.register('warning-message',() => new WarningMessageViewController(),'modal-box');

	class OverlayComponent extends Component{

		constructor(){
			super();
		}

		render(){
			$('overlay-container').innerHTML = `<div class="group" id="overlay-buttons">
																						<div id="overlay" class="hide onclick"></div>
																					</div>`;
		}

		show(){
			$('overlay').classList.remove('hide');
		}

		hide(){
			$('overlay').classList.add('hide');
		}
	}

	class OverlayViewController{
		constructor(){
			this.UIcomponent = new OverlayComponent();

			this.UIcomponent.refresh();

			this.UIcomponent.attach('overlay-buttons',o => {
				switch(o.event.name){
					/* clicked */
					case 'onclick':

						switch(o.element.id){
							case 'overlay':

								['bottombar','sidebar','modal-box'].forEach(e => {
									GLOBAL_QUEUE.callActionByCategory(e,o => {
										o.UIcomponent.hide();
									});
								});
								
								this.UIcomponent.hide();

							break;
						}
						
					break;
				}
			});

		}
	}

	GLOBAL_QUEUE.register('overlay',() => new OverlayViewController());

	class ModalOverlayComponent extends Component{

		constructor(){
			super();
		}

		render(){
			$('modal-overlay-container').innerHTML = `<div class="group" id="modal-overlay-buttons">
																									<div id="modal-overlay" class="hide onclick"></div>
																								</div>
																								<link rel="stylesheet" href="css/modal-overlay.css">`;
		}

		show(){
			$('modal-overlay').classList.remove('hide');
		}

		hide(){
			$('modal-overlay').classList.add('hide');
		}
	}

	class ModalOverlayViewController{
		constructor(){
			this.UIcomponent = new ModalOverlayComponent();

			this.UIcomponent.refresh();

			this.UIcomponent.attach('modal-overlay-buttons',o => {
				
				switch(o.event.name){
					/* clicked */
					case 'onclick':

						switch(o.element.id){
							case 'modal-overlay':

								['bottombar','sidebar','modal-box'].forEach(e => {
									GLOBAL_QUEUE.callActionByCategory(e,o => {
										o.UIcomponent.hide();
									});
								});
								
								this.UIcomponent.hide();

							break;
						}
						
					break;
				}
			});

		}
	}

	GLOBAL_QUEUE.register('modal-overlay',() => new ModalOverlayViewController());

	class SidebarComponent extends Component{

		constructor(){
			super();

			this.uiID = $('sidebar');
		}

		render(){
			this.uiID.innerHTML = `<nav id="sidebar-buttons" class="group">
												      <div class="logo">
												        Mobile <span>CAM</span>
												     	</div>
												     	<div style="margin-bottom:20px"></div>
												     	
												     	<a class="item" href="https://mobilecamcnc.github.io/products/#download">
												     		<div class="sign"></div><label>Download</label>
												     	</a>
												     	<a class="item" href="https://mobilecamcnc.github.io/products/faq.html">
												     		<div class="sign"></div><label>FAQ</label>
												     	</a>
												     	
												     	<a class="item" href="https://mobilecamcnc.github.io/products/#contact">
												     		<div class="sign"></div><label>Contact</label>
												     	</a>

												     	<div class="bar"></div>
												     	<a class="item" href="https://www.facebook.com/Mobile-CAM-CNC-109696747422561/">
												     		<div class="sign"></div><label>Facebook</label>
												     	</a>
												     	<a class="item" href="https://www.instagram.com/mobilecamcnc/">
												     		<div class="sign"></div><label>Instagram</label>
												     	</a>
												     	<a class="item" href="https://www.youtube.com/channel/UC1jqMGHbE-v0UPthEAwQl_w?view_as=subscriber">
												     		<div class="sign"></div><label>Youtube</label>
												     	</a>
												     </nav>`;
		}

		show(){
			this.uiID.classList.add('show-sidebar');
		}

		hide(){
			this.uiID.classList.remove('show-sidebar');
		}
	}

	class SidebarViewController{
		constructor(){
			this.UIcomponent = new SidebarComponent();

			this.UIcomponent.refresh();

			this.UIcomponent.attach('sidebar-buttons',o => {
				switch(o.event.name){
					/* clicked */
					case 'onclick':
						
						if(typeof o.element.dataset.id !== 'undefined'){

							this.UIcomponent.getGroupById('sidebar-buttons',elements => {
								elements.forEach(e => {
									e.classList.remove('active-sidebar-selected');
								});
							});
							
							this.UIcomponent.getGroupById('sidebar-buttons',elements => {
								elements.forEach(e => {
									if(e.dataset.id === o.element.dataset.id){
										e.classList.add('active-sidebar-selected');
									}
								});
							});

							GLOBAL_QUEUE.call(o.element.dataset.id);


							switch(o.element.dataset.id){
								case 'quiz':
									GLOBAL_QUEUE.callByNameAndCategory('secondtopbar','topbar');
								break;
								case 'add':
									GLOBAL_QUEUE.callByNameAndCategory('searchtopbar','topbar');
								break;
								default:
									GLOBAL_QUEUE.callByNameAndCategory('topbar','topbar');
								break;
							}

							this.hide();
						}
					
					break;
					/* hover */
					case 'onmauseover':
						
						if(typeof o.element.dataset.id !== 'undefined'){

							this.UIcomponent.getGroupById('sidebar-buttons',elements => {
								elements.forEach(e => {
									e.classList.remove('active-sidebar-hover');
								});
							});
							
							this.UIcomponent.getGroupById('sidebar-buttons',elements => {
								elements.forEach(e => {
									if(e.dataset.id === o.element.dataset.id){
										e.classList.add('active-sidebar-hover');
									}
								});
							});
						}
					
					break;
				}
				
			});
		}

		hide(){
			this.UIcomponent.hide();

			GLOBAL_QUEUE.call('overlay',o => {
				o.UIcomponent.hide();
			});
		}
	}

	GLOBAL_QUEUE.register('sidebar',() => new SidebarViewController(),'sidebar');

	[{
		name:'standard-menu',
		cat:'menu'
	},{
		name:'sidebar',
		cat:'sidebar'
	}].forEach(o => {
		GLOBAL_QUEUE.callByNameAndCategory(o.name,o.cat);
	})
})();
