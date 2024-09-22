<?php
/**
 * Display the Activity Listing
 */
    // Set the number of items to fetch
    $numberOfItems  = isset($attributes['numberOfItems']) ? $attributes['numberOfItems'] : 5;
    $activityType   = isset($attributes['activityType']) ? $attributes['activityType'] : 'all';
    $layout         = isset($attributes['layout']) && $attributes['layout'] == 'grid' ? 'activity-grid': 'activity-list';
    $showDate       = isset($attributes['showDate']) ? $attributes['showDate'] : true;
    $avatarSize     = isset($attributes['avatarSize']) ? $attributes['avatarSize'] : 45;
    $hideHeading    = isset($attributes['hideHeading']) ? $attributes['hideHeading'] : false;
    

    // Set the API endpoint based on activity type
    $endpoint = 'buddypress/v1/activity?per_page=' . $numberOfItems;

    if ($activityType === 'my') {
        // Replace with the appropriate API call for user-specific activities
        $endpoint .= '&user_id=' . get_current_user_id(); // Assuming this is how you fetch user activities
    } elseif ($activityType === 'favorites') {
        // Replace with the appropriate API call for favorite activities
       $endpoint .= '&scope=favorites&user_id=' . get_current_user_id();
    }

    // Fetch activities from the BuddyPress REST API    
    $response = wp_remote_get(rest_url($endpoint));
    
    // Check for errors in the response
    if (is_wp_error($response)) {
        return '<p>' . __('Error loading activities.', 'buddypress-activity-listing') . '</p>';
    }

    // Get the body of the response
    $activities = json_decode(wp_remote_retrieve_body($response));
    
    // Check if there are activities
    if (empty($activities)) {
        return '<p>' . __('No activities found.', 'buddypress-activity-listing') . '</p>';
    }
    ?>
    <div class="activity-listing">
        <?php if( ! $hideHeading ){ ?>
        <h2 class="wb-heading">
            <?php
                switch ($activityType) {
                    case 'my':
                        echo __('My Activities', 'buddypress-activity-listing');
                        break;
                    case 'favorites':
                        echo __('My Favorite Activities', 'buddypress-activity-listing');
                        break;
                    case 'all':
                    default:
                        echo __('All Activities', 'buddypress-activity-listing');
                        break;
                    }
            ?>
        </h2>
        <?php } ?>
        <ul class="activity-front-ul">
            <?php foreach ($activities as $activity): 
                $content        = !empty($activity->content->rendered) ? wp_strip_all_tags($activity->content->rendered) : 'No content';
                $avatarUrl      = !empty($activity->user_avatar->thumb) ? $activity->user_avatar->thumb : '';
                $activityTime   = human_time_diff(strtotime($activity->date)) . ' ' . __('ago', 'buddypress-activity-listing');
                $activityTitle  = !empty($activity->title) ? wp_strip_all_tags($activity->title) : 'No title';
            ?>
                <li class="wb-activity-item <?php echo esc_attr( $layout ); ?>" key="<?php echo esc_attr($activity->id); ?>">
                    <div class="wb-activity-meta">
                        <?php if ($avatarUrl): ?>
                            <img class="wb-activity-user-avatar" src="<?php echo esc_url($avatarUrl); ?>" alt="<?php echo esc_attr($activityTitle); ?>" style="width: <?php echo esc_attr($avatarSize); ?>px; height: <?php echo esc_attr($avatarSize); ?>px;"/>
                        <?php endif; ?>
                        <div>
                            <span class="wb-activity-timedate"><?php echo esc_html($activityTitle); ?><?php if ($showDate): ?>&nbsp;&nbsp;<strong><?php echo esc_html($activityTime); ?></strong> <?php endif; ?></span>
                        </div>
                    </div>
                    <div class="wb-activity-content">
                        <p><?php echo esc_html($content); ?></p>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
