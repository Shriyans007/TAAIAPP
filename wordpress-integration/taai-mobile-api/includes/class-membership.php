<?php
defined('ABSPATH') || exit;
final class TAAI_Mobile_Membership { public static function get() { $id=TAAI_Mobile_Security::user_id();if(!function_exists('wcs_get_users_subscriptions'))return ['status'=>'none','membershipType'=>null];$subscriptions=wcs_get_users_subscriptions($id);if(!$subscriptions)return ['status'=>'none','membershipType'=>null];$s=reset($subscriptions);$items=$s->get_items();$item=reset($items);return ['status'=>sanitize_key($s->get_status()),'membershipType'=>$item?$item->get_name():null,'startDate'=>$s->get_date('date_created'),'nextPayment'=>$s->get_date('next_payment')?:null,'endDate'=>$s->get_date('end')?:null,'manageUrl'=>wc_get_account_endpoint_url('subscriptions')]; } }

