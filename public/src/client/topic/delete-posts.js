'use strict';

define('forum/topic/delete-posts', [
	'postSelect', 'alerts', 'api',
], function (postSelect, alerts, api) {
	const DeletePosts = {};
	let modal;
	let deleteBtn;
	let purgeBtn;
	let tid;

	DeletePosts.init = function () {
		tid = ajaxify.data.tid;

		$(window).off('action:ajaxify.end', onAjaxifyEnd).on('action:ajaxify.end', onAjaxifyEnd);

		if (modal) {
			return;
		}

		app.parseAndTranslate('modals/delete-posts', {}, function (html) {
			modal = html;
			$('body').append(modal);
			deleteBtn = modal.find('#delete_posts_confirm');
			purgeBtn = modal.find('#purge_posts_confirm');

			modal.find('#delete_posts_cancel').on('click', closeModal);

			// Refactor postSelect.init out into a separate function
			initPostSelect();

			deleteBtn.on('click', function () {
				console.log('Delete button clicked'); // Added for debugging
				deletePosts(deleteBtn, pid => `/posts/${pid}/state`);
			});

			purgeBtn.on('click', function () {
				console.log('Purge button clicked'); // Added for debugging
				deletePosts(purgeBtn, pid => `/posts/${pid}`);
			});
		});
	};

	// Separate function to reduce nesting depth
	function initPostSelect() {
		postSelect.init(function () {
			console.log('Post select initialized'); // Added for debugging
			checkButtonEnable();
			showPostsSelected();
		});
		showPostsSelected();
	}

	function onAjaxifyEnd() {
		if (ajaxify.data.template.name !== 'topic' || ajaxify.data.tid !== tid) {
			closeModal();
			$(window).off('action:ajaxify.end', onAjaxifyEnd);
		}
	}

	function deletePosts(btn, route) {
		btn.attr('disabled', true);
		console.log('Deleting posts...'); // Added for debugging
		Promise.all(postSelect.pids.map(pid => api.del(route(pid), {})))
			.then(() => {
				console.log('Posts deleted successfully'); // Added for debugging
				closeModal();
			})
			.catch(alerts.error)
			.finally(() => {
				btn.removeAttr('disabled');
			});
	}

	function showPostsSelected() {
		console.log('Showing selected posts'); // Added for debugging
		if (postSelect.pids.length) {
			modal.find('#pids').translateHtml('[[topic:fork-pid-count, ' + postSelect.pids.length + ']]');
		} else {
			modal.find('#pids').translateHtml('[[topic:fork-no-pids]]');
		}
	}

	function checkButtonEnable() {
		if (postSelect.pids.length) {
			deleteBtn.removeAttr('disabled');
			purgeBtn.removeAttr('disabled');
		} else {
			deleteBtn.attr('disabled', true);
			purgeBtn.attr('disabled', true);
		}
	}

	function closeModal() {
		if (modal) {
			modal.remove();
			modal = null;
			postSelect.disable();
		}
	}

	return DeletePosts;
});
