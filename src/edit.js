// import packages
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { PanelBody, RangeControl, SelectControl, ToggleControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import './editor.scss';


export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);

    // Get the number of items from attributes
    const { numberOfItems, activityType, layout, showDate, avatarSize, hideHeading } = attributes;

    useEffect(() => {
        let path = `buddypress/v1/activity?per_page=${numberOfItems}`;
    
        if (activityType === 'my') {
            // Fetch user-specific activities
            path += `&user_id=1`;
        } else if (activityType === 'favorites') {
            // Fetch favorite activities
            path += '&scope=favorites';
        }
        apiFetch({ path })            
            .then((data) => {				
                setActivities(data);
            })
            .catch((error) => {
                console.error('Error fetching activities:', error);
                setError(error.message);
            });
    }, [activityType, numberOfItems]);

    //exclude html
    const stripHTML = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const timeAgo = (date) => {
        const now = new Date(); // Local current time
        const activityDate = new Date(date + 'Z'); // Server activity time in UTC
        const seconds = Math.floor((now - activityDate) / 1000);
    
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval === 1 ? '1 year ago' : `${interval} years ago`;
        }
    
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval === 1 ? '1 month ago' : `${interval} months ago`;
        }
    
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval === 1 ? '1 day ago' : `${interval} days ago`;
        }
    
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
        }
    
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
        }
    
        return `${Math.floor(seconds)} seconds ago`;
    };
    
    
    // Dynamic heading based on activityType
    const getHeadingText = () => {
        switch (activityType) {
            case 'my':
                return __('My Activities', 'buddypress-activity-listing');
            case 'favorites':
                return __('My Favorite Activities', 'buddypress-activity-listing');
            case 'all':
            default:
                return __('All Activities', 'buddypress-activity-listing');
        }
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Activity Settings', 'buddypress-activity-listing')} initialOpen={true}>
                    <RangeControl
                        label={__('Number of Activities to Display', 'buddypress-activity-listing')}
                        value={numberOfItems}
                        onChange={(newVal) => setAttributes({ numberOfItems: newVal })}
                        min={1}
                        max={20}
                    />
                     <RangeControl
                            label={__('Avatar Size', 'buddypress-activity-listing')}
                            value={attributes.avatarSize}
                            onChange={(newVal) => setAttributes({ avatarSize: newVal })}
                            min={20}
                            max={100}
                        />
                    <SelectControl
                        label={__('Activity Type', 'buddypress-activity-listing')}
                        value={activityType}
                        options={[
                            { label: __('All Activities', 'buddypress-activity-listing'), value: 'all' },
                            { label: __('My Activities', 'buddypress-activity-listing'), value: 'my' },
                            { label: __('Favorite Activities', 'buddypress-activity-listing'), value: 'favorites' },
                        ]}
                        onChange={(newVal) => setAttributes({ activityType: newVal })}
                    />
                     <SelectControl
                     label={__('Display Layout', 'buddypress-activity-listing')}
                     value={layout}
                        options={[
                            { label: __('List View', 'buddypress-activity-listing'), value: 'list' },
                            { label: __('Grid View', 'buddypress-activity-listing'), value: 'grid' },
                        ]}
                        onChange={(newVal) => setAttributes({ layout: newVal })}
                        />
                        <ToggleControl
                            label={__('Show Activity Date', 'buddypress-activity-listing')}
                            checked={attributes.showDate}
                            onChange={(newVal) => setAttributes({ showDate: newVal })}
                        />
                        <ToggleControl
                            label={__('Hide Page Heading', 'buddypress-activity-listing')}
                            checked={attributes.hideHeading}
                            onChange={(newVal) => setAttributes({ hideHeading: newVal })}
                        />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps} style={{ backgroundColor: 'transparent' }}>
            {!attributes.hideHeading && <h2 style={{ color: 'black' }}>{getHeadingText()}</h2>}
                {error ? (
                    <p>{__('Error loading activities:', 'buddypress-activity-listing')} {error}</p>
                ) : (
                    <ul>
                        {activities.length === 0 ? (
                            <li>{__('No activities found.', 'buddypress-activity-listing')}</li>
                        ) : (
                            activities.slice(0, numberOfItems).map((activity) => {
                                const content = activity.content ? stripHTML( activity.content.rendered ) : 'No content';
                                const avatarUrl = activity.user_avatar && activity.user_avatar.thumb;
                                const activityTime = timeAgo(activity.date);

                                const activityTitle = stripHTML(activity.title);
                                const activityClass = layout === 'grid' ? 'activity-grid' : 'activity-list';
                                return (
                                    <li className={`wb-activity-item ${activityClass}`} key={activity.id}>
                                        <div className="wb-activity-meta">
                                            {avatarUrl && (
                                                <img className="wb-activity-user-avatar"
                                                    src={avatarUrl}
                                                    style={{
                                                        width: `${avatarSize}px`,
                                                        height: `${avatarSize}px`
                                                    }}
                                                />
                                            )}
                                            <div>
                                                <span className="wb-activity-timedate">
                                                    {activityTitle}{showDate && (
                                                        <>&nbsp;&nbsp;<strong>{activityTime}</strong></>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="wb-activity-content">
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
