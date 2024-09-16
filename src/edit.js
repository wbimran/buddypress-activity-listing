// import packages
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { PanelBody, RangeControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);

    // Get the number of items from attributes
    const { numberOfItems } = attributes;

    useEffect(() => {
        apiFetch({ path: 'buddypress/v1/activity' })            
            .then((data) => {				
                setActivities(data);
            })
            .catch((error) => {
                console.error('Error fetching activities:', error);
                setError(error.message);
            });
    }, []);

    //exclude html
    const stripHTML = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = Math.floor(seconds / 31536000);

        if (interval > 1) {
            return interval + ' years ago';
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + ' months ago';
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + ' days ago';
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + ' hours ago';
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + ' minutes ago';
        }
        return Math.floor(seconds) + ' seconds ago';
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Activity Settings', 'todo-list')} initialOpen={true}>
                    <RangeControl
                        label={__('Number of Activities to Display', 'todo-list')}
                        value={numberOfItems}
                        onChange={(newVal) => setAttributes({ numberOfItems: newVal })}
                        min={1}
                        max={20}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps} style={{ backgroundColor: 'transparent' }}>
                <h2 style={{ color: 'black' }}>{__('BuddyPress Activity Listing', 'todo-list')}</h2>
                {error ? (
                    <p>{__('Error loading activities:', 'todo-list')} {error}</p>
                ) : (
                    <ul>
                        {activities.length === 0 ? (
                            <li>{__('No activities found.', 'todo-list')}</li>
                        ) : (
                            activities.slice(0, numberOfItems).map((activity) => {
                                const content = activity.content ? stripHTML( activity.content.rendered ) : 'No content';
                                const avatarUrl = activity.user_avatar && activity.user_avatar.thumb;
                                const activityTime = timeAgo(activity.date);
                                const activityTitle = stripHTML(activity.title);

                                return (
                                    <li key={activity.id} style={{ marginBottom: '20px', listStyle: 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {avatarUrl && (
                                                <img
                                                    src={avatarUrl}
                                                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
                                                />
                                            )}
                                            <div>
                                                <span style={{ fontSize: '0.85em', color: 'black' }}>
                                                    {activityTitle}&nbsp;&nbsp;{activityTime}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '10px', color: 'black' }}>
                                            <p>{content}</p>
                                        </div>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                )}
            </div>
        </>
    );
}
