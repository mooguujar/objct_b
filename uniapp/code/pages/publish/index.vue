
<template>
	<view class="container">
		<view class="publish-form">
			<!-- 标题输入 -->
			<view class="form-item">
				<u-input 
					v-model="article.title" 
					placeholder="请输入文章标题" 
					:clearable="true"
					:border="true"
				></u-input>
			</view>

			<!-- 封面图片 -->
			<view class="form-item">
				<view class="form-label">封面图片</view>
				<u-upload 
					:action="uploadAction" 
					:file-list="coverList"
					:max-count="1"
					:show-progress="true"
					:deletable="true"
					:max-size="5 * 1024 * 1024"
					@on-success="uploadSuccess"
					@on-remove="uploadRemove"
				></u-upload>
			</view>

			<!-- 内容编辑器 -->
			<view class="form-item">
				<view class="form-label">文章内容</view>
				<view class="editor-toolbar">
					<u-icon 
						v-for="(tool, index) in editorTools" 
						:key="index" 
						:name="tool.icon" 
						size="32"
						:color="tool.active ? '#007AFF' : '#606266'"
						@click="toggleEditorTool(tool)"
					></u-icon>
				</view>
				<view class="editor-content">
					<u-input 
						v-model="article.content" 
						type="textarea" 
						placeholder="请输入文章内容..." 
						:height="300"
						:auto-height="false"
					></u-input>
				</view>
			</view>

			<!-- 标签选择 -->
			<view class="form-item">
				<view class="form-label">文章标签</view>
				<view class="tag-selector">
					<u-tag 
						v-for="(tag, index) in availableTags" 
						:key="index" 
						:text="tag.name" 
						:type="tag.selected ? 'primary' : 'info'"
						:mode="tag.selected ? 'dark' : 'plain'"
						shape="circle"
						@click="toggleTag(tag)"
					></u-tag>
				</view>
				<view class="custom-tag">
					<u-input 
						v-model="customTag" 
						placeholder="添加自定义标签" 
						:clearable="true"
						:border="true"
					></u-input>
					<u-button 
						type="primary" 
						size="mini" 
						@click="addCustomTag"
						:disabled="!customTag"
					>
						添加
					</u-button>
				</view>
			</view>

			<!-- 发布设置 -->
			<view class="form-item">
				<view class="form-label">发布设置</view>
				<u-cell-group>
					<u-cell-item 
						title="文章类型" 
						:value="articleTypeOptions[article.type].label" 
						arrow-direction="right"
						@click="showArticleTypePicker = true"
					></u-cell-item>
					<u-cell-item 
						title="发布时间" 
						:value="publishTimeOptions[article.publishTime].label" 
						arrow-direction="right"
						@click="showPublishTimePicker = true"
					></u-cell-item>
				</u-cell-group>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-btn">
				<u-button 
					type="primary" 
					size="default" 
					@click="submitArticle"
					:loading="submitting"
					:disabled="!canSubmit"
				>
					{{ submitting ? '发布中...' : '发布文章' }}
				</u-button>
			</view>
		</view>

		<!-- 文章类型选择器 -->
		<u-select 
			v-model="showArticleTypePicker" 
			:list="articleTypeOptions" 
			@confirm="confirmArticleType"
		></u-select>

		<!-- 发布时间选择器 -->
		<u-select 
			v-model="showPublishTimePicker" 
			:list="publishTimeOptions" 
			@confirm="confirmPublishTime"
		></u-select>
	</view>
</template>

<script>
export default {
	data() {
		return {
			article: {
				title: '',
				cover: '',
				content: '',
				tags: [],
				type: 0,
				publishTime: 0
			},
			coverList: [],
			uploadAction: 'https://example.com/upload', // 实际项目中替换为真实的上传地址
			editorTools: [
				{ icon: 'bold', active: false },
				{ icon: 'italic', active: false },
				{ icon: 'underline', active: false },
				{ icon: 'list', active: false },
				{ icon: 'photo', active: false },
				{ icon: 'link', active: false }
			],
			availableTags: [
				{ name: 'JavaScript', selected: false },
				{ name: 'Vue', selected: false },
				{ name: 'React', selected: false },
				{ name: 'Node.js', selected: false },
				{ name: '小程序', selected: false },
				{ name: 'TypeScript', selected: false },
				{ name: 'Webpack', selected: false },
				{ name: 'CSS', selected: false },
				{ name: 'HTML5', selected: false },
				{ name: 'Git', selected: false }
			],
			customTag: '',
			showArticleTypePicker: false,
			articleTypeOptions: [
				{ value: 0, label: '原创' },
				{ value: 1, label: '转载' },
				{ value: 2, label: '翻译' }
			],
			showPublishTimePicker: false,
			publishTimeOptions: [
				{ value: 0, label: '立即发布' },
				{ value: 1, label: '定时发布' }
			],
			submitting: false
		}
	},
	computed: {
		canSubmit() {
			return this.article.title && this.article.content && this.article.tags.length > 0;
		}
	},
	methods: {
		uploadSuccess(data, index, lists) {
			this.article.cover = data.url;
			this.coverList = [{
				url: data.url
			}];
		},
		uploadRemove(index, lists) {
			this.article.cover = '';
			this.coverList = [];
		},
		toggleEditorTool(tool) {
			tool.active = !tool.active;
			// 实际项目中这里应该实现编辑器功能
		},
		toggleTag(tag) {
			tag.selected = !tag.selected;
			this.updateSelectedTags();
		},
		addCustomTag() {
			if (!this.customTag) return;

			// 检查是否已存在
			const exists = this.availableTags.some(tag => tag.name === this.customTag);
			if (exists) {
				uni.showToast({
					title: '标签已存在',
					icon: 'none'
				});
				return;
			}

			// 添加新标签
			this.availableTags.push({
				name: this.customTag,
				selected: true
			});

			this.customTag = '';
			this.updateSelectedTags();
		},
		updateSelectedTags() {
			this.article.tags = this.availableTags
				.filter(tag => tag.selected)
				.map(tag => tag.name);
		},
		confirmArticleType(e) {
			this.article.type = e[0].value;
		},
		confirmPublishTime(e) {
			this.article.publishTime = e[0].value;

			if (e[0].value === 1) {
				// 定时发布，显示时间选择器
				// 实际项目中这里应该实现时间选择功能
				uni.showToast({
					title: '定时发布功能开发中',
					icon: 'none'
				});
			}
		},
		async submitArticle() {
			if (!this.canSubmit) {
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none'
				});
				return;
			}

			this.submitting = true;

			try {
				// 实际项目中这里应该调用云函数或API提交文章
				// 模拟提交延迟
				await new Promise(resolve => setTimeout(resolve, 1500));

				uni.showToast({
					title: '发布成功',
					icon: 'success'
				});

				// 延迟跳转
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
					});
				}, 1500);
			} catch (error) {
				uni.showToast({
					title: '发布失败，请重试',
					icon: 'none'
				});
			} finally {
				this.submitting = false;
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	padding: 20rpx;
}

.publish-form {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 20rpx;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	font-weight: 500;
	margin-bottom: 16rpx;
}

.editor-toolbar {
	display: flex;
	padding: 16rpx;
	background-color: #f5f5f5;
	border-radius: 8rpx 8rpx 0 0;

	.u-icon {
		margin-right: 20rpx;
	}
}

.editor-content {
	border-radius: 0 0 8rpx 8rpx;
	overflow: hidden;
}

.tag-selector {
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 16rpx;

	.u-tag {
		margin-right: 16rpx;
		margin-bottom: 16rpx;
	}
}

.custom-tag {
	display: flex;

	.u-input {
		flex: 1;
		margin-right: 16rpx;
	}
}

.submit-btn {
	margin-top: 40rpx;
}
</style>
