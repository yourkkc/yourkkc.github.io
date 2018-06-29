---
layout: post
title: '开发ANDROID TV APP 遇到的问题及解决方法 不定时更新'
subtitle: ''
date: 2018-06-29
categories: framework
cover: 'https://yourkkc.github.io/assets/img/source/2018-06-29-开发ANDROIDTVAPP遇到的问题及解决方法不定时更新.jpg'
tags: 原创 代码 app
---


>一人一语一夜，夜已深      
>千面千心千帆，帆欲沉

        
        

---

最近半年很忙，一直在做各种开发，有点闲下来的时候，想起了我的小小窝，没人看就没人看吧，我也该添加些东西了，零零碎碎的，想到什么，就加什么吧。

最近在做TV的app开发，接触到的最基础的问题是操作交互的改变，从触摸变成了遥控，焦点获取的问题就是个迈不过去的坎。这篇文章其实很easy，那也写一下吧。个人整合了代码，实现了遥控简单操作焦点的功能

代码：
```

import android.view.KeyEvent;
import android.view.View;

/**
 * 由 yourkkc 在 2018/2/7 10:01 创建
 */
public class FocusNextUtils {


    /**
     * 设置当前视图的上下左右键视图  根据event事件
     *
     * @param keyCode event事件
     * @param currentView 当前focus视图
     * @param left 左指令 视图  null为不响应当前指令
     * @param up 上指令 视图 null为不响应当前指令
     * @param right 右指令 视图 null为不响应当前指令
     * @param down 下指令 视图 null为不响应当前指令
     */
    public static boolean setLURD(int keyCode, View currentView, View left, View up, View right, View down) {

        switch (keyCode) {
            case KeyEvent.KEYCODE_DPAD_RIGHT:
                if (right != null)
                    focusInNextView(currentView, right);
                else
                    getCurrentFocus(currentView);
                break;
            case KeyEvent.KEYCODE_DPAD_LEFT:
                if (left != null)
                    focusInNextView(currentView,left);
                else
                    getCurrentFocus(currentView);

                break;
            case KeyEvent.KEYCODE_DPAD_UP:
                if (up != null)
                    focusInNextView(currentView, up);
                else
                    getCurrentFocus(currentView);
                break;
            case KeyEvent.KEYCODE_DPAD_DOWN:
                if (down != null)
                    focusInNextView(currentView, down);
                else
                    getCurrentFocus(currentView);
                break;
        }
        return true;
    }

    /**
     *  切换当前focus视图
     * @param currentHasFocusView 当前focus视图
     * @param nextView 下一个focus视图
     */
    private static void focusInNextView(View currentHasFocusView, View nextView) {

        if (currentHasFocusView != null){
            currentHasFocusView.setFocusable(false);
            currentHasFocusView.setFocusableInTouchMode(false);
            currentHasFocusView.clearFocus();
        }
        nextView.setFocusable(true);
        nextView.setFocusableInTouchMode(true);
        nextView.requestFocus();
    }

    /**
     * 将视图view 设置为focus
     * @param view
     */
    public static void getCurrentFocus(View view) {
        focusInNextView(null, view);
    }
}



```

具体使用方法 贴一部分app代码：

```
//在重写的  onKeyDown(int keyCode, KeyEvent event)方法内部
 if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
                    if(keyCode==KeyEvent.KEYCODE_VOLUME_UP){
                        volumeUp();
                        return true;
                    }else if(keyCode== KeyEvent.KEYCODE_VOLUME_DOWN){
                        volumeDown();
                        return true;
                    }else {
                        return super.onKeyDown(keyCode, event);
                    }
                } else {
                    if (getCurrentFocus() == screenSurfaceViewContainer) {

                        if (categorys != null && categorys.size() > 0) {

                            return FocusNextUtils.setLURD(keyCode, screenSurfaceViewContainer,
                                    null, null, liveDetailsLayout, bottomListView);
                        } else {
                            return FocusNextUtils.setLURD(keyCode, screenSurfaceViewContainer,
                                    null, null, liveDetailsLayout, null);
                        }

                    } else if (getCurrentFocus() == liveDetailsLayout) {

                        if (mLiveVideos != null && mLiveVideos.size() > 0) {
                            return FocusNextUtils.setLURD(keyCode, liveDetailsLayout,
                                    screenSurfaceViewContainer, null, null, livesListView);
                        } else {
                            return FocusNextUtils.setLURD(keyCode, liveDetailsLayout,
                                    screenSurfaceViewContainer, null, null, setTextView);
                        }

                    } else if (getCurrentFocus() == livesListView) {
                        return FocusNextUtils.setLURD(keyCode, livesListView,
                                screenSurfaceViewContainer, liveDetailsLayout, null, setTextView);
                    } else if (getCurrentFocus() == bottomListView) {
                        return FocusNextUtils.setLURD(keyCode, bottomListView,
                                null, setTextView, null, null);
                    } else if (getCurrentFocus() == setTextView) {
                        View top = null;
                        View bottom = null;
                        if (mLiveVideos != null && mLiveVideos.size() > 0) {
                            top = livesListView;
                        } else {
                            top = liveDetailsLayout;
                        }
                        if (categorys != null && categorys.size() > 0) {
                            bottom = bottomListView;
                        }
                        return FocusNextUtils.setLURD(keyCode, setTextView,
                                screenSurfaceViewContainer, top, null, bottom);
                    } else {

                        return super.onKeyDown(keyCode, event);
                    }
                }
            }


```

---
如果有人来看，仔细看应该是能看的懂的，不懂留言吧



---
> 残影梦半，雨落阑珊，佳期难期人缠怨。
> 缺月枫寒，风起渐晚，相识易逝独凭栏。————小小草
