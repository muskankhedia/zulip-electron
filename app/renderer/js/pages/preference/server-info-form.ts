'use strict';

import { remote, ipcRenderer } from 'electron';

import BaseComponent = require('../../components/base');
import DomainUtil = require('../../utils/domain-util');
import Messages = require('./../../../../resources/messages');
import t = require('../../utils/translation-util');

const { dialog } = remote;

class ServerInfoForm extends BaseComponent {
	// TODO: TypeScript - Here props should be object type
	props: any;
	$serverInfoForm: Element;
	$serverInfoAlias: Element;
	$serverIcon: Element;
	$deleteServerButton: Element;
	$openServerButton: Element;
	$muteServerButton: Element;
	constructor(props: any) {
		super();
		this.props = props;
	}

	template(): string {
		return `
			<div class="settings-card">
				<div class="server-info-left">
					<img class="server-info-icon" src="${this.props.server.icon}"/>
					<div class="server-info-row">
						<span class="server-info-alias">${this.props.server.alias}</span>
						<i class="material-icons open-tab-button">open_in_new</i>
					</div>
				</div>
				<div class="server-info-right">
					<div class="server-info-row server-url">
						<span class="server-url-info" title="${this.props.server.url}">${this.props.server.url}</span>
					</div>
					<div class="server-info-row">
						<div class="action gray server-mute-notifications">
						<span>${this.props.muteText}</span>
					</div>
					<div class="server-info-row">
						<div class="action red server-delete-action">
							<span>${t.__('Disconnect')}</span>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	init(): void {
		this.initForm();
		this.initActions();
	}

	initForm(): void {
		this.$serverInfoForm = this.generateNodeFromTemplate(this.template());
		this.$serverInfoAlias = this.$serverInfoForm.querySelectorAll('.server-info-alias')[0];
		this.$serverIcon = this.$serverInfoForm.querySelectorAll('.server-info-icon')[0];
		this.$deleteServerButton = this.$serverInfoForm.querySelectorAll('.server-delete-action')[0];
		this.$openServerButton = this.$serverInfoForm.querySelectorAll('.open-tab-button')[0];
		this.props.$root.append(this.$serverInfoForm);
	}

	initActions(): void {
		this.$deleteServerButton.addEventListener('click', () => {
			dialog.showMessageBox({
				type: 'warning',
				buttons: [t.__('YES'), t.__('NO')],
				defaultId: 0,
				message: t.__('Are you sure you want to disconnect this organization?')
			}, response => {
				if (response === 0) {
					if (DomainUtil.removeDomain(this.props.index)) {
						ipcRenderer.send('reload-full-app');
					} else {
						const { title, content } = Messages.orgRemovalError(DomainUtil.getDomain(this.props.index).url);
						dialog.showErrorBox(title, content);
					}
				}
			});
		});

		this.$openServerButton.addEventListener('click', () => {
			ipcRenderer.send('forward-message', 'switch-server-tab', this.props.index);
		});

		this.$serverInfoAlias.addEventListener('click', () => {
			ipcRenderer.send('forward-message', 'switch-server-tab', this.props.index);
		});

		this.$serverIcon.addEventListener('click', () => {
			ipcRenderer.send('forward-message', 'switch-server-tab', this.props.index);
		});

		this.$muteServerButton.addEventListener('click', () => {
			dialog.showMessageBox({
				type: 'warning',
				buttons: ['YES', 'NO'],
				defaultId: 0,
				message: 'Are you sure you want to ' + this.props.muteText.toLowerCase() + ' this organization?'
			}, response => {
				if (response === 0) {
					const muteLabel = this.props.$root.children[this.props.index].children[1].children[1].children[0];
					if (DomainUtil.getDomain(this.props.index).muted) {
						muteLabel.innerHTML = 'Unmute';
						this.props.muteText = 'Unmute';
					} else {
						muteLabel.innerHTML = 'Mute';
						this.props.muteText = 'Mute';
					}
					ipcRenderer.send('forward-message', 'mute-org', this.props.index);
				}
			});
		});
	}
}

export = ServerInfoForm;
